import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import Admin from '@aotf/models/Admin';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

// Define types for populated Application
// interface PopulatedTeacher {
//   _id: string;
//   teacherId: string;
//   name: string;
//   email: string;
//   phone: string;
// }

// interface PopulatedPost {
//   _id: string;
//   postId: string;
//   subject: string;
//   className: string;
//   board: string;
//   classType: string;
//   location: string;
//   notes: string;
// }

// interface PopulatedApplication {
//   _id: string;
//   status: string;
//   appliedAt: string | Date;
//   withdrawalRequestedAt?: string | Date;
//   withdrawalRequestedBy?: string;
//   withdrawalNote?: string;
//   teacherId?: PopulatedTeacher | null;
//   postId?: PopulatedPost | null;
// }

// POST /api/admin/applications/withdrawal-approval - Approve or reject withdrawal request
export async function POST(req: NextRequest) {
  const logPrefix = '[POST /api/admin/applications/withdrawal-approval]';
  
  try {
    console.log(logPrefix, 'Processing withdrawal approval/rejection...');

    // Authenticate and verify admin
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.success || !authResult.user) {
      console.error(logPrefix, 'Unauthorized:', authResult.error);
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify user is an admin
    const admin = await Admin.findOne({ email: authResult.user.email });
    if (!admin) {
      console.error(logPrefix, 'Admin not found for email:', authResult.user.email);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get request body
    const { applicationId, action } = await req.json();

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Application ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    
    if (!application) {
      console.error(logPrefix, 'Application not found:', applicationId);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if application has withdrawal request pending
    if (application.status !== 'withdrawal-requested') {
      return NextResponse.json({ 
        error: 'This application does not have a pending withdrawal request',
        currentStatus: application.status 
      }, { status: 400 });
    }

    const adminId = String(admin._id);

    if (action === 'approve') {
      // Approve withdrawal - mark as withdrawn
      application.status = 'withdrawn';
      application.withdrawalApprovedAt = new Date();
      application.withdrawalApprovedBy = adminId;
      
      // Remove teacher from post's applicants array
      const Post = (await import('@aotf/models/Post')).default;
      await Post.updateOne(
        { _id: application.postId },
        { $pull: { applicants: application.teacherId } }
      );
      
      console.log(logPrefix, 'Removing teacher from post applicants:', application.teacherId, application.postId);
      console.log(logPrefix, 'Withdrawal approved for application:', applicationId);

      await application.save();

      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal request approved successfully',
        application: {
          _id: application._id,
          status: application.status,
          withdrawalApprovedAt: application.withdrawalApprovedAt,
          withdrawalApprovedBy: application.withdrawalApprovedBy,
        }
      });

    } else {
      // Reject withdrawal - revert to previous status (pending or approved)
      // Check what the status was before withdrawal request
      // For now, we'll default to 'pending' but you might want to track the previous status
      application.status = 'pending';
      application.withdrawalRejectedAt = new Date();
      application.withdrawalRejectedBy = adminId;
      // Clear withdrawal request fields
      application.withdrawalRequestedAt = undefined;
      application.withdrawalRequestedBy = undefined;
      application.withdrawalNote = undefined;
      
      console.log(logPrefix, 'Withdrawal rejected for application:', applicationId);

      await application.save();

      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal request rejected. Application restored to pending status.',
        application: {
          _id: application._id,
          status: application.status,
          withdrawalRejectedAt: application.withdrawalRejectedAt,
          withdrawalRejectedBy: application.withdrawalRejectedBy,
        }
      });
    }

  } catch (error: unknown) {
    console.error(logPrefix, 'Error processing withdrawal approval:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal approval', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/admin/applications/withdrawal-approval - Get all withdrawal requests pending approval
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/admin/applications/withdrawal-approval]';
  
  try {
    console.log(logPrefix, 'Fetching pending withdrawal requests...');

    // Authenticate and verify admin
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.success || !authResult.user) {
      console.error(logPrefix, 'Unauthorized:', authResult.error);
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify user is an admin
    const admin = await Admin.findOne({ email: authResult.user.email });
    if (!admin) {
      console.error(logPrefix, 'Admin not found for email:', authResult.user.email);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Find all applications with withdrawal-requested status
    const applications = await Application.find({ status: 'withdrawal-requested' })
      .populate('postId')
      .populate('teacherId')
      .sort({ withdrawalRequestedAt: -1 }) // Most recent first
      .lean();

    console.log(logPrefix, `Found ${applications.length} pending withdrawal requests`);

    // Format the response with explicit type guards
    const result = (Array.isArray(applications) ? applications : []).map((app) => {
      // Type guards for populated fields
      const teacher = (app.teacherId && typeof app.teacherId === 'object' && '_id' in app.teacherId) ? {
        _id: String(app.teacherId._id),
        teacherId: String(app.teacherId.teacherId),
        name: String(app.teacherId.name),
        email: String(app.teacherId.email),
        phone: String(app.teacherId.phone),
      } : null;
      const post = (app.postId && typeof app.postId === 'object' && '_id' in app.postId) ? {
        _id: String(app.postId._id),
        postId: String(app.postId.postId),
        subject: String(app.postId.subject),
        className: String(app.postId.className),
        board: String(app.postId.board),
        classType: String(app.postId.classType),
        location: String(app.postId.location),
        notes: String(app.postId.notes),
      } : null;
      return {
        _id: String(app._id),
        status: String(app.status),
        appliedAt: app.appliedAt,
        withdrawalRequestedAt: app.withdrawalRequestedAt,
        withdrawalRequestedBy: app.withdrawalRequestedBy,
        withdrawalNote: app.withdrawalNote,
        teacher,
        post,
      };
    });

    return NextResponse.json({ 
      success: true, 
      applications: result,
      count: result.length
    });

  } catch (error: unknown) {
    console.error(logPrefix, 'Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
