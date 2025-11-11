import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post, { IPost } from '@aotf/models/Post';
import Guardian, { IGuardian } from '@aotf/models/Guardian';
import User, { IUser } from '@aotf/models/User';
import Application from '@aotf/models/Application';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import Teacher from '@aotf/models/Teacher';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

export async function GET(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    await connectToDatabase();
    const { postId } = await context.params;

    // Find post by postId (e.g., "POST-12345") or by MongoDB _id
    let post: IPost | null = null;
    
    // Try to find by postId first
    post = await Post.findOne({ postId: postId });
    
    // If not found and the ID looks like a MongoDB ObjectId, try that
    if (!post && mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get current user (teacher) if authenticated
    let currentTeacherId: mongoose.Types.ObjectId | null = null;
    let hasApplied = false;
    
    try {
      const cookieStore = await cookies();
      const tokenValue = getAuthTokenFromCookies(cookieStore);
      if (tokenValue) {
        // Verify the token to get userId
        const tokenData = verifyAuthToken(tokenValue);
        if (tokenData) {
          const userId = tokenData.userId;
          
          if (userId) {
            // Find user first, then teacher by email
            const user = await User.findById(userId);
            if (user) {
              const teacher = await Teacher.findOne({ email: user.email });
              if (teacher) {
                currentTeacherId = teacher._id as mongoose.Types.ObjectId;
                
                // Check if teacher has applied to this post
                const application = await Application.findOne({
                  teacherId: currentTeacherId,
                  postId: post._id?.toString()
                });
                hasApplied = !!application;
              }
            }
          }
        }
      }
    } catch (err) {
      console.log('Not authenticated as teacher:', err);
    }

    // Check if post has an approved teacher
    const approvedApplication = await Application.findOne({
      postId: post._id,
      status: 'approved'
    });
    const hasApprovedTeacher = !!approvedApplication;

    // Fetch guardian and user data
    let guardianInfo: unknown = null;
    let userInfo: unknown = null;

    if (post.guardianId) {
      guardianInfo = await Guardian.findOne({ guardianId: post.guardianId }).lean();
    }

    if (post.userId) {
      userInfo = await User.findOne({ email: post.userId }).lean();
    }

    // Type guard for guardian info
    const isGuardianInfo = (obj: unknown): obj is IGuardian => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'guardianId' in obj &&
        'name' in obj
      );
    };

    // Type guard for user info
    const isUserInfo = (obj: unknown): obj is IUser => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'email' in obj &&
        'name' in obj
      );
    };

    const validGuardianInfo = isGuardianInfo(guardianInfo) ? guardianInfo : null;
    const validUserInfo = isUserInfo(userInfo) ? userInfo : null;

    // Priority: Guardian name (by ID) > User name > Post name > Anonymous
    const displayName = validGuardianInfo?.name || validUserInfo?.name || post.name || 'Anonymous Guardian';

    // Format the response
    const formattedPost = {
      id: post._id?.toString() || '',
      postId: post.postId,
      userId: post.userId,
      guardian: displayName,
      guardianLocation: validGuardianInfo?.location,
      subject: post.subject,
      class: `Class - ${post.className}`,
      board: `Board - ${post.board || 'Not specified'}`,
      location: post.location || validGuardianInfo?.location,
      budget: post.monthlyBudget ? `₹${post.monthlyBudget}/month` : 'Budget not specified',
      monthlyBudget: post.monthlyBudget,
      genderPreference: 'No preference',
      description: post.notes || 'No additional details provided',
      postedDate: getTimeAgo(post.createdAt),
      applicants: post.applicants?.length || 0,
      status: post.status,
      classType: post.classType,
      frequency: post.frequencyPerWeek,
      preferredTime: post.preferredTime,
      preferredDays: post.preferredDays || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      editedBy: post.editedBy,
      editedAt: post.editedAt,
      editedByUserId: post.editedByUserId,
      editedByName: post.editedByName,
      hasApplied,
      hasApprovedTeacher,
    };

    return NextResponse.json({ 
      post: formattedPost,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
}
