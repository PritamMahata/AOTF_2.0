import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET - Fetch teacher's notification preferences
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate teacher
    const authResult = await requireTeacherAuth(req);
    
    if (!authResult.success || !authResult.teacher) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Teacher access required' },
        { status: 401 }
      );
    }

    const teacher = authResult.teacher as { notificationPreferences?: { marketingEmails: boolean; guardianResponses: boolean } };

    return NextResponse.json({
      success: true,
      notificationPreferences: teacher.notificationPreferences || {
        marketingEmails: true,
        guardianResponses: true,
      },
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update teacher's notification preferences
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate teacher
    const authResult = await requireTeacherAuth(req);
    
    if (!authResult.success || !authResult.teacher) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Teacher access required' },
        { status: 401 }
      );
    }

    const teacherData = authResult.teacher as { email: string };

    // Parse request body
    const body = await req.json();
    const { marketingEmails, guardianResponses } = body;

    // Validate input
    if (typeof marketingEmails !== 'boolean' || typeof guardianResponses !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification preferences format' },
        { status: 400 }
      );
    }

    // Find and update teacher
    const teacher = await Teacher.findOneAndUpdate(
      { email: teacherData.email },
      {
        $set: {
          'notificationPreferences.marketingEmails': marketingEmails,
          'notificationPreferences.guardianResponses': guardianResponses,
        },
      },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPreferences: teacher.notificationPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
