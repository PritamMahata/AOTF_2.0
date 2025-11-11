import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@aotf/lib/mongodb';
import Guardian from '@aotf/models/Guardian';
import { requireGuardianAuth } from '@aotf/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET - Fetch guardian's notification preferences
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate guardian
    const authResult = await requireGuardianAuth(req);
    
    if (!authResult.success || !authResult.guardian) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Guardian access required' },
        { status: 401 }
      );
    }

    const guardian = authResult.guardian as { notificationPreferences?: { marketingEmails: boolean; teacherAlerts: boolean } };

    return NextResponse.json({
      success: true,
      notificationPreferences: guardian.notificationPreferences || {
        marketingEmails: true,
        teacherAlerts: true,
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

// PUT - Update guardian's notification preferences
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate guardian
    const authResult = await requireGuardianAuth(req);
    
    if (!authResult.success || !authResult.guardian) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Guardian access required' },
        { status: 401 }
      );
    }

    const guardianData = authResult.guardian as { email: string };

    // Parse request body
    const body = await req.json();
    const { marketingEmails, teacherAlerts } = body;

    // Validate input
    if (typeof marketingEmails !== 'boolean' || typeof teacherAlerts !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification preferences format' },
        { status: 400 }
      );
    }

    // Find and update guardian
    const guardian = await Guardian.findOneAndUpdate(
      { email: guardianData.email },
      {
        $set: {
          'notificationPreferences.marketingEmails': marketingEmails,
          'notificationPreferences.teacherAlerts': teacherAlerts,
        },
      },
      { new: true, runValidators: true }
    );

    if (!guardian) {
      return NextResponse.json(
        { success: false, error: 'Guardian profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPreferences: guardian.notificationPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
