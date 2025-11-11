import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import AdminNotification from '@aotf/models/AdminNotification';
import Teacher from '@aotf/models/Teacher';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';

// POST /api/teacher/applications/request-withdrawal - Request to withdraw an application
export async function POST(req: NextRequest) {
  const logPrefix = '[POST /api/teacher/applications/request-withdrawal]';
  
  try {
    console.log(logPrefix, 'Processing withdrawal request...');

    // Authenticate and get teacher
    const authResult = await requireTeacherAuth(req);
    if (!authResult.success || !authResult.teacher) {
      console.error(logPrefix, 'Unauthorized:', authResult.error);
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    // Use explicit type for teacher
    type TeacherAuth = { _id: string; teacherId: string; name?: string };
    const teacher = authResult.teacher as TeacherAuth;
    const teacherId = teacher._id;

    // Get request body
    const { applicationId, withdrawalNote } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the application
    const application = await Application.findById(applicationId);
    
    if (!application) {
      console.error(logPrefix, 'Application not found:', applicationId);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify the application belongs to this teacher
    if (String(application.teacherId) !== String(teacherId)) {
      console.error(logPrefix, 'Application does not belong to this teacher');
      return NextResponse.json({ error: 'Unauthorized to withdraw this application' }, { status: 403 });
    }

    // Check if application is in a state that can be withdrawn
    if (application.status === 'withdrawn') {
      return NextResponse.json({ error: 'Application is already withdrawn' }, { status: 400 });
    }

    if (application.status === 'withdrawal-requested') {
      return NextResponse.json({ error: 'Withdrawal request already pending' }, { status: 400 });
    }

    if (application.status === 'completed') {
      return NextResponse.json({ error: 'Cannot withdraw completed application' }, { status: 400 });
    }

    // Update application status to withdrawal-requested
    application.status = 'withdrawal-requested';
    application.withdrawalRequestedAt = new Date();
    application.withdrawalRequestedBy = teacher.teacherId;
    application.withdrawalNote = withdrawalNote || '';

    await application.save();

    // Fetch full teacher details for notification
    const teacherDetails = await Teacher.findById(teacherId);
    const teacherName = teacherDetails?.name || teacher.name || 'Unknown Teacher';
    const teacherCustomId = teacherDetails?.teacherId || teacher.teacherId || 'Unknown';

    // Create admin notification
    await AdminNotification.create({
      type: 'withdrawal-request',
      applicationId: application._id,
      teacherId: application.teacherId,
      teacherName,
      teacherCustomId,
      postId: application.postId,
      withdrawalNote: application.withdrawalNote,
      status: 'pending',
      requestedAt: application.withdrawalRequestedAt,
      read: false,
    });

    console.log(logPrefix, 'Withdrawal request submitted successfully for application:', applicationId);

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted successfully. Waiting for admin approval.',
      application: {
        _id: application._id,
        status: application.status,
        withdrawalRequestedAt: application.withdrawalRequestedAt,
        withdrawalNote: application.withdrawalNote,
      }
    });

  } catch (error) {
    console.error(logPrefix, 'Error processing withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
