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

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject') || '';
    const className = searchParams.get('class') || '';
    const board = searchParams.get('board') || '';
    const location = searchParams.get('location') || '';
    
    console.log('🔍 Filter params received:', { search, subject, className, board, location });
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Get current user (teacher) if authenticated
    let currentTeacherId: mongoose.Types.ObjectId | null = null;
    try {
      const cookieStore = await cookies();
      const tokenValue = getAuthTokenFromCookies(cookieStore);
      if (tokenValue) {
        const tokenData = verifyAuthToken(tokenValue);
        const userId = tokenData?.userId;
        
        if (userId) {
          // Find user first, then teacher by email
          const user = await User.findById(userId);
          if (user) {
            const teacher = await Teacher.findOne({ email: user.email });
            if (teacher) {
              currentTeacherId = teacher._id as mongoose.Types.ObjectId;
              console.log('✅ Authenticated teacher ID:', currentTeacherId);
            }
          }
        }
      }
    } catch (err) {
      console.log('Not authenticated as teacher:', err);
    }

    // Show all posts to everyone
    const query: Record<string, unknown> = {};
    if (search) {
      // Search across all visible fields including budget
      const searchRegex = { $regex: search, $options: 'i' };
      const numericSearch = parseInt(search);
      
      query.$or = [
        { subject: searchRegex },
        { name: searchRegex },
        { notes: searchRegex },
        { className: searchRegex },
        { board: searchRegex },
        { classType: searchRegex },
        { preferredTime: searchRegex },
        { location: searchRegex },
        { frequencyPerWeek: searchRegex },
        { status: searchRegex },
        // Search by budget if search term is numeric
        ...(isNaN(numericSearch) ? [] : [{ monthlyBudget: numericSearch }])
      ];
    }
    if (subject && subject !== 'All subjects') {
      query.subject = subject;
    }
    if (className && className !== 'All classes') {
      // Remove "Class " or "Class-" prefix to match database format
      // Database stores as "9", filter sends "Class 9" or "Class-9"
      const normalizedClass = className.replace(/^Class[\s-]+/i, '');
      query.className = normalizedClass;
    }
    if (board && board !== 'All boards') {
      // Remove "Board - " prefix to match database format
      // Database stores as "CBSE", filter might send "Board - CBSE"
      const normalizedBoard = board.replace(/^Board[\s-]+/i, '');
      query.board = normalizedBoard;
    }
    if (location) {
      // Case-insensitive location search
      query.location = { $regex: location, $options: 'i' };
    }
    
    console.log('📋 Final MongoDB query:', JSON.stringify(query, null, 2));
      // Fetch paginated posts
    const posts = await Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await Post.countDocuments(query);
    
    console.log('📊 Total posts found:', posts.length);
    console.log('📊 Total count:', totalCount);
    console.log('📊 Page:', page, 'of', Math.ceil(totalCount / limit));
    
    // Collect all guardianIds from posts
    const guardianIds = posts
      .map((post: IPost) => post.guardianId)
      .filter((id): id is string => !!id);
    
    // Collect user emails as fallback
    const userEmails = posts
      .map((post: IPost) => post.userId)
      .filter((email): email is string => !!email);
    
    console.log('📧 Guardian IDs to lookup:', guardianIds.length);
    console.log('📧 User emails to lookup:', userEmails.length);
    
    // Fetch teacher's applications if authenticated
    let appliedPostIds = new Set<string>();
    if (currentTeacherId) {
      console.log('🔍 Looking for applications by teacher:', currentTeacherId.toString());
      const applications = await Application.find({ 
        teacherId: currentTeacherId 
      }).select('postId').lean();
      appliedPostIds = new Set(applications.map(app => app.postId.toString()));
      console.log('✅ Teacher has applied to', appliedPostIds.size, 'posts');
      console.log('✅ Applied post IDs:', Array.from(appliedPostIds));
    } else {
      console.log('⚠️ No teacher ID found - user not authenticated as teacher');
    }

    // Fetch all posts with approved applications
    const postIds = posts.map((post: IPost) => post._id);
    const approvedApplications = await Application.find({
      postId: { $in: postIds },
      status: 'approved'
    }).select('postId').lean();
    const postsWithApprovedTeacher = new Set(approvedApplications.map(app => app.postId.toString()));
    console.log('✅ Posts with approved teacher:', postsWithApprovedTeacher.size);
    
    // Fetch BOTH Guardian (by guardianId) and User data
    const [guardians, users] = await Promise.all([
      Guardian.find({ guardianId: { $in: guardianIds } }).lean(),
      User.find({ email: { $in: userEmails } }).lean()
    ]);
    
    console.log('👤 Guardians found:', guardians.length);
    console.log('👥 Users found:', users.length);
    
    // Create maps for quick lookup
    const guardianMapById = new Map<string, IGuardian>(
      guardians
        .filter(isGuardian)
        .map((g) => [g.guardianId, g as unknown as IGuardian])
    );
    const userMap = new Map<string, IUser>(
      users
        .filter(isUser)
        .map((u) => [u.email.toLowerCase(), u as unknown as IUser])
    );
    
    const guardianPosts = posts.map((post: IPost) => {
      // First try to get guardian by guardianId (most accurate)
      const guardianInfo = post.guardianId ? guardianMapById.get(post.guardianId) : null;
      
      // Fallback to user by email if no guardian found
      const email = post.userId?.toLowerCase();
      const userInfo = email ? userMap.get(email) : null;
      
      // Priority: Guardian name (by ID) > User name > Post name > Anonymous
      const displayName = guardianInfo?.name || userInfo?.name || post.name || 'Anonymous Guardian';
      
      if (post.guardianId && !guardianInfo) {
        console.log('⚠️ Guardian ID exists but not found:', post.guardianId);
      }
      
      const postIdString = post._id?.toString() || '';
      const hasApplied = appliedPostIds.has(postIdString);
      const hasApprovedTeacher = postsWithApprovedTeacher.has(postIdString);
      
      if (hasApplied) {
        console.log('✓ Post marked as APPLIED:', postIdString, post.subject);
      }
      if (hasApprovedTeacher) {
        console.log('✓ Post has APPROVED teacher:', postIdString, post.subject);
      }
      
      return {
        id: post._id?.toString() || post.id,
        postId: post.postId,
        userId: post.userId, // Include userId for ownership checks
        // Use Guardian collection data if available, otherwise User data, otherwise fall back to post data
        guardian: displayName,
        // guardianId: Hidden for privacy
        // guardianEmail: Hidden for privacy
        // guardianPhone: Hidden for privacy
        guardianLocation: guardianInfo?.location,
        // guardianWhatsapp: Hidden for privacy
        subject: post.subject,
        class: `Class - ${post.className}`,
        board: `Board - ${post.board || 'Not specified'}`,
        location: post.location || guardianInfo?.location,
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
    });
      return NextResponse.json({ 
      posts: guardianPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + posts.length < totalCount
      }
    });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed posts' },
      { status: 500 }
    );
  }
}

// Type guard for IGuardian
function isGuardian(obj: unknown): obj is IGuardian {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'guardianId' in obj &&
    typeof (obj as IGuardian).guardianId === 'string' &&
    'email' in obj &&
    typeof (obj as IGuardian).email === 'string'
  );
}

// Type guard for IUser
function isUser(obj: unknown): obj is IUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'email' in obj &&
    typeof (obj as IUser).email === 'string'
  );
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