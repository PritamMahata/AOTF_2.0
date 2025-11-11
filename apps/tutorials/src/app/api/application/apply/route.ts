import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';
import Application from '@aotf/models/Application';
import mongoose from 'mongoose';
import Post from '@aotf/models/Post'; // ✅ import directly instead of mongoose.model()

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate teacher
    const authResult = await requireTeacherAuth(request);
    console.log('Auth Result:', JSON.stringify(authResult, null, 2));
    
    if (authResult.error || !authResult.teacher) {
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

    // ✅ Validate teacherId - use the teacher document's _id
    let validTeacherId: mongoose.Types.ObjectId;
    try {
      type TeacherAuth = { _id?: string; id?: string };
      const teacherData: TeacherAuth = authResult.teacher;
      console.log('Teacher Data:', teacherData);
      
      // Try different possible _id locations
      const teacherIdValue = teacherData._id || teacherData.id;
      console.log('Teacher ID Value:', teacherIdValue);
      
      if (!teacherIdValue) {
        return NextResponse.json({ error: 'Teacher ID not found in auth result' }, { status: 400 });
      }
      
      validTeacherId = new mongoose.Types.ObjectId(String(teacherIdValue));
      console.log('Valid Teacher ID:', validTeacherId);
    } catch (error) {
      console.error('Teacher ID validation error:', error);
      return NextResponse.json({ error: 'Invalid teacherId format' }, { status: 400 });
    }

    // ✅ Prevent duplicate application
    const existing = await Application.findOne({ postId: validPostId, teacherId: validTeacherId });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this post.' },
        { status: 409 }
      );
    }

    // ✅ Add teacherId to post's applicants array
    const post = await Post.findById(validPostId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.applicants?.some((id: mongoose.Types.ObjectId) => id.equals(validTeacherId))) {
      return NextResponse.json(
        { error: 'You have already applied to this post.' },
        { status: 409 }
      );
    }

    post.applicants = post.applicants || [];
    post.applicants.push(validTeacherId);
    await post.save();

    // ✅ Create application document
    const application = new Application({
      postId: validPostId,
      teacherId: validTeacherId,
      status: 'pending',
      appliedAt: new Date(),
    });

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
