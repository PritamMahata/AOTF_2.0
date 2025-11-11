import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post from '@aotf/models/Post';
import Application from '@aotf/models/Application';
import Teacher from '@aotf/models/Teacher';
import Guardian from '@aotf/models/Guardian';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';
import Admin from '@aotf/models/Admin';
import { verifyAdminAuth } from '@aotf/lib/admin-auth';

// Helper function to check if request is from an authenticated admin
async function getAuthenticatedAdmin(req: NextRequest) {
  const authData = await verifyAdminAuth(req);
  return authData?.admin || null;
}

// GET /api/posts/[postId] - Fetch a single post with all details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const logPrefix = '[GET /api/posts/[postId]]';
  
  try {
    const { postId } = await context.params;
    console.log(logPrefix, 'Fetching post:', postId);

    // Check if user is an admin first
    const adminUser = await getAuthenticatedAdmin(req);
    
    let authUser = null;
    let isAdmin = false;
    
    if (adminUser) {
      // User is an admin
      isAdmin = true;
      authUser = adminUser;
      console.log(logPrefix, 'Admin authenticated:', adminUser.email);
    } else {
      // Try regular user authentication
      const authResult = await getAuthenticatedUser(req);
      if (!authResult.success || !authResult.user) {
        console.error(logPrefix, 'Authentication failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      authUser = authResult.user;
      console.log(logPrefix, 'User authenticated:', authUser.email);
    }

    await connectToDatabase();

    // Find the post
    const post = await Post.findOne({ postId }).lean();

    if (!post) {
      console.log(logPrefix, 'Post not found');
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user is the owner (admins always have access)
    const isOwner = !isAdmin && (post.userId === authUser.id || post.userId === authUser.email);

    // Fetch guardian details
    let guardianDetails: unknown = null;
    if (post.guardianId) {
      guardianDetails = await Guardian.findOne({ guardianId: post.guardianId }).lean();
    } else if (post.email) {
      guardianDetails = await Guardian.findOne({ email: post.email.toLowerCase() }).lean();
    }

    // If owner or admin, fetch applications for this post
    let applications: unknown[] = [];
    if (isOwner || isAdmin) {
      const apps = await Application.find({ postId: post._id })
        .populate({
          path: 'teacherId',
          model: Teacher,
          select: 'teacherId name email phone location experience qualifications subjectsTeaching teachingMode bio hourlyRate availability rating totalGuardians avatar whatsappNumber',
        })
        .lean();

      applications = (apps as Array<Record<string, unknown>>).map((app) => ({
        _id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        teacher: app.teacherId,
        postId: app.postId,
      }));
    }

    // Check if post has an approved teacher
    const approvedApplication = await Application.findOne({
      postId: post._id,
      status: 'approved'
    });
    const hasApprovedTeacher = !!approvedApplication;

    // Format the response
    const formattedPost = {
      id: post._id,
      postId: post.postId,
      userId: post.userId,
      guardian: post.name || (guardianDetails as Record<string, unknown>)?.name || 'Guardian',
      guardianId: post.guardianId,
      guardianEmail: post.email || (guardianDetails as Record<string, unknown>)?.email,
      guardianPhone: post.phone || (guardianDetails as Record<string, unknown>)?.phone,
      guardianLocation: post.location || (guardianDetails as Record<string, unknown>)?.location,
      guardianWhatsapp: (guardianDetails as Record<string, unknown>)?.whatsappNumber,
      subject: post.subject,
      class: post.className,
      board: post.board,
      location: post.location,
      budget: post.monthlyBudget ? `₹${post.monthlyBudget}/month` : 'Negotiable',
      monthlyBudget: post.monthlyBudget,
      genderPreference: 'Any',
      description: post.notes || '',
      postedDate: new Date(post.createdAt).toLocaleDateString('en-GB'),
      applicants: post.applicants?.length || 0,
      status: post.status || 'open',
      classType: post.classType,
      frequency: post.frequencyPerWeek,
      preferredTime: post.preferredTime,
      preferredDays: post.preferredDays || [],
      isOwner,
      applications,
      hasApprovedTeacher,
      editedBy: post.editedBy,
      editedAt: post.editedAt,
      editedByUserId: post.editedByUserId,
      editedByName: post.editedByName,
    };

    console.log(logPrefix, 'Successfully fetched post');
    return NextResponse.json({ 
      success: true,
      post: formattedPost 
    });
  } catch (error) {
    console.error(logPrefix, 'Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[postId] - Update a post
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const logPrefix = '[PATCH /api/posts/[postId]]';
  
  try {
    const { postId } = await context.params;
    console.log(logPrefix, 'Updating post:', postId);

    // Check if user is an admin first
    const adminUser = await getAuthenticatedAdmin(req);
    
    let authUser = null;
    let isAdmin = false;
    
    if (adminUser) {
      // User is an admin
      isAdmin = true;
      authUser = adminUser;
      console.log(logPrefix, 'Admin authenticated:', adminUser.email);
    } else {
      // Try regular user authentication
      const authResult = await getAuthenticatedUser(req);
      if (!authResult.success || !authResult.user) {
        console.error(logPrefix, 'Authentication failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      authUser = authResult.user;
      console.log(logPrefix, 'User authenticated:', authUser.email);
    }

    await connectToDatabase();

    // Find the post
    const post = await Post.findOne({ postId });

    if (!post) {
      console.log(logPrefix, 'Post not found');
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user is the owner OR an admin
    const isOwner = post.userId === authUser.id || post.userId === authUser.email;
    
    if (!isOwner && !isAdmin) {
      console.error(logPrefix, 'User is not the owner of this post or an admin');
      return NextResponse.json({ error: 'Forbidden: You can only edit your own posts or must be an admin' }, { status: 403 });
    }

    // Check if post has an approved teacher - guardians cannot edit after teacher assignment
    if (!isAdmin) {
      const approvedApplication = await Application.findOne({
        postId: post._id,
        status: 'approved'
      });
      
      if (approvedApplication) {
        console.error(logPrefix, 'Cannot edit post: A teacher has already been assigned');
        return NextResponse.json({ 
          error: 'Cannot edit post', 
          message: 'Post details cannot be changed after a teacher has been assigned. Please contact support if you need to make changes.' 
        }, { status: 403 });
      }
    }

    // Parse request body
    const body = await req.json();
    
    // Update allowed fields
    const updateFields: Record<string, unknown> = {};
    if (body.subject !== undefined) updateFields.subject = body.subject;
    if (body.className !== undefined) updateFields.className = body.className;
    if (body.board !== undefined) updateFields.board = body.board;
    if (body.preferredTime !== undefined) updateFields.preferredTime = body.preferredTime;
    if (body.preferredDays !== undefined) updateFields.preferredDays = body.preferredDays;
    if (body.frequencyPerWeek !== undefined) updateFields.frequencyPerWeek = body.frequencyPerWeek;
    if (body.classType !== undefined) updateFields.classType = body.classType;
    if (body.location !== undefined) updateFields.location = body.location;
    if (body.monthlyBudget !== undefined) updateFields.monthlyBudget = body.monthlyBudget;
    if (body.notes !== undefined) updateFields.notes = body.notes;

    // Track edit metadata - determine editor type and get their name
    let editorType: 'guardian' | 'admin' | 'teacher' = 'guardian'; // default
    let editorName = '';

    // Check if user is admin (we already checked this above)
    if (isAdmin && adminUser) {
      editorType = 'admin';
      editorName = adminUser.name || 'Admin';
    } else {
      // Check if editing user is a guardian
      const Guardian = (await import('@aotf/models/Guardian')).default;
      const guardian = await Guardian.findOne({ userId: authUser.id }).lean() as unknown as Record<string, unknown> | null;
      if (guardian) {
        editorType = 'guardian';
        editorName = (guardian.name as string) || 'Guardian';
      } else {
        // Check if teacher
        const Teacher = (await import('@aotf/models/Teacher')).default;
        const teacher = await Teacher.findOne({ userId: authUser.id }).lean() as unknown as Record<string, unknown> | null;
        if (teacher) {
          editorType = 'teacher';
          editorName = (teacher.name as string) || 'Teacher';
        }
      }
    }

    updateFields.editedBy = editorType;
    updateFields.editedAt = new Date();
    updateFields.editedByUserId = authUser.id;
    updateFields.editedByName = editorName;

    // Update the post
    Object.assign(post, updateFields);
    await post.save();

    console.log(logPrefix, 'Successfully updated post');
    return NextResponse.json({ 
      success: true,
      message: 'Post updated successfully',
      post: {
        postId: post.postId,
        ...updateFields
      }
    });
  } catch (error) {
    console.error(logPrefix, 'Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
