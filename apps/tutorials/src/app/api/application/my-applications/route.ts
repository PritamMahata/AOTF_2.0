import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';
import Application from '@aotf/models/Application';
import mongoose from 'mongoose';

/**
 * GET /api/application/my-applications
 * Returns all postIds that the current teacher has applied to
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate teacher
    const authResult = await requireTeacherAuth(request);
    
    if (authResult.error || !authResult.teacher) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Get teacher ID
    // Use an explicit type for teacherData
    type TeacherAuth = { _id?: string; id?: string };
    const teacherData: TeacherAuth = authResult.teacher;
    const teacherIdValue = teacherData._id || teacherData.id;
    
    if (!teacherIdValue) {
      return NextResponse.json({ error: 'Teacher ID not found' }, { status: 400 });
    }

    let validTeacherId: mongoose.Types.ObjectId;
    try {
      validTeacherId = new mongoose.Types.ObjectId(String(teacherIdValue));
    } catch {
      return NextResponse.json({ error: 'Invalid teacher ID format' }, { status: 400 });
    }

    // Find all applications by this teacher
    const applications = await Application.find({ 
      teacherId: validTeacherId 
    }).select('postId').lean();

    // Extract postIds and convert to strings
    const appliedPostIds = applications.map(app => app.postId.toString());

    return NextResponse.json({
      success: true,
      appliedPostIds,
      count: appliedPostIds.length
    });
  } catch (error: unknown) {
    console.error('My applications API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: String(error) },
      { status: 500 }
    );
  }
}
