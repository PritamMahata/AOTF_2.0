import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';
import Application from '@aotf/models/Application';
import Freelancer from '@aotf/models/Freelancer';
import mongoose from 'mongoose';
import Post from '@aotf/models/Post';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate user (teacher or freelancer)
    const authResult = await getAuthenticatedUser(request);
    console.log('Auth Result:', JSON.stringify(authResult, null, 2));
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // ✅ Validate postId
    let validPostId: mongoose.Types.ObjectId;
    try {
      validPostId = new mongoose.Types.ObjectId(postId);
    } catch {
      return NextResponse.json({ error: 'Invalid postId format' }, { status: 400 });
    }

    // Handle both freelancer and teacher applications
    let applicantId: string | mongoose.Types.ObjectId;
    let existingQuery: Record<string, unknown>;
    let applicationData: Record<string, unknown>;

    if (authResult.freelancer) {
      // Freelancer application (jobs app)
      const freelancer = await Freelancer.findOne({ email: authResult.user.email });
      if (!freelancer) {
        return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
      }
      
      applicantId = freelancer.freelancerId;
      existingQuery = { postId: validPostId, freelancerId: applicantId };
      applicationData = {
        postId: validPostId,
        freelancerId: applicantId,
        status: 'pending',
        appliedAt: new Date(),
      };
    } else if (authResult.teacher) {
      // Teacher application (tutorials app)
      type TeacherAuth = { _id?: string; id?: string };
      const teacherData: TeacherAuth = authResult.teacher;
      const teacherIdValue = teacherData._id || teacherData.id;
      
      if (!teacherIdValue) {
        return NextResponse.json({ error: 'Teacher ID not found in auth result' }, { status: 400 });
      }
      
      try {
        applicantId = new mongoose.Types.ObjectId(String(teacherIdValue));
      } catch (error) {
        console.error('Teacher ID validation error:', error);
        return NextResponse.json({ error: 'Invalid teacherId format' }, { status: 400 });
      }
      
      existingQuery = { postId: validPostId, teacherId: applicantId };
      applicationData = {
        postId: validPostId,
        teacherId: applicantId,
        status: 'pending',
        appliedAt: new Date(),
      };
    } else {
      return NextResponse.json(
        { error: 'User must be a freelancer or teacher to apply' },
        { status: 403 }
      );
    }

    // ✅ Prevent duplicate application
    const existing = await Application.findOne(existingQuery);
    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this post.' },
        { status: 409 }
      );
    }

    // ✅ Add applicant to post's applicants array
    const post = await Post.findById(validPostId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }    post.applicants = post.applicants || [];
    
    // Check if already in applicants array
    const applicantAlreadyExists = authResult.freelancer
      ? post.applicants?.some((id: unknown) => String(id) === String(applicantId))
      : post.applicants?.some((id: unknown) => {
          if (id instanceof mongoose.Types.ObjectId) {
            return id.equals(applicantId as mongoose.Types.ObjectId);
          }
          return false;
        });
    
    if (applicantAlreadyExists) {
      return NextResponse.json(
        { error: 'You have already applied to this post.' },
        { status: 409 }
      );
    }

    post.applicants.push(applicantId as any);
    await post.save();

    // ✅ Create application document
    const application = new Application(applicationData);
    await application.save();

    return NextResponse.json({
      success: true,
      applicationId: application._id,
    });
  } catch (error: unknown) {
    console.error('Application API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application', details: String(error) },
      { status: 500 }
    );
  }
}
