import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import Post from '@aotf/models/Post';
import Teacher from '@aotf/models/Teacher';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

// GET /api/application/post-details - Fetch applications for posts owned by current user
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/application/post-details]';
  
  try {
    // Authenticate user
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.success || !authResult.user) {
      console.error(logPrefix, 'Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    console.log(logPrefix, 'Fetching applications for user:', userId);

    await connectToDatabase();

    // Find all posts owned by this user
    const userPosts = await Post.find({ 
      $or: [
        { userId: userId },
        { userId: authResult.user.email }
      ]
    }).select('_id postId').lean();

    if (userPosts.length === 0) {
      console.log(logPrefix, 'No posts found for user');
      return NextResponse.json({ applications: {} });
    }

    const postIds = userPosts.map(post => post._id);
    console.log(logPrefix, `Found ${userPosts.length} posts, fetching applications...`);

    // Find all applications for these posts
    const applications = await Application.find({ 
      postId: { $in: postIds } 
    })
      .populate({
        path: 'teacherId',
        model: Teacher,
        select: 'teacherId name email phone location experience qualifications subjectsTeaching teachingMode bio hourlyRate availability rating totalGuardians avatar whatsappNumber',
      })
      .lean();

    console.log(logPrefix, `Found ${applications.length} total applications`);

    // Group applications by postId
    type PopulatedTeacher = {
      _id: string;
      teacherId: string;
      name: string;
      email: string;
      phone?: string;
      location?: string;
      experience?: string;
      qualifications?: string;
      subjectsTeaching?: string;
      teachingMode?: string;
      bio?: string;
      hourlyRate?: number;
      availability?: string;
      rating?: number;
      totalGuardians?: number;
      avatar?: string;
      whatsappNumber?: string;
    };
    type PopulatedApplication = {
      _id: string;
      status: string;
      appliedAt: Date;
      teacherId: PopulatedTeacher;
      postId: string;
    };
    // Define the lean application type
    // type LeanApplication = {
    //   _id: string;
    //   status: string;
    //   appliedAt: Date;
    //   teacherId: PopulatedTeacher;
    //   postId: string;
    // };
    // Group applications by postId with type guards
    const applicationsByPost: Record<string, PopulatedApplication[]> = {};

    for (const post of userPosts) {
      const postIdStr = String(post._id);
      const postApplications: PopulatedApplication[] = applications
        .filter(app =>
          app &&
          typeof app === 'object' &&
          'postId' in app &&
          String(app.postId) === postIdStr &&
          'teacherId' in app &&
          app.teacherId &&
          typeof app.teacherId === 'object' &&
          'teacherId' in app.teacherId &&
          'name' in app.teacherId &&
          'email' in app.teacherId &&
          'status' in app &&
          'appliedAt' in app &&
          '_id' in app
        )
        .map(app => ({
          _id: String(app._id),
          status: String(app.status),
          appliedAt: app.appliedAt as Date,
          teacherId: app.teacherId as PopulatedTeacher,
          postId: String(app.postId),
        }));

      if (postApplications.length > 0) {
        applicationsByPost[post.postId || postIdStr] = postApplications;
      }
    }

    console.log(logPrefix, 'Returning applications for', Object.keys(applicationsByPost).length, 'posts');
    return NextResponse.json({ 
      success: true,
      applications: applicationsByPost 
    });
  } catch (error) {
    console.error(logPrefix, 'Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
