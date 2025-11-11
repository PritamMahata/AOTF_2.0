import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import AdminNotification from '@aotf/models/AdminNotification';
import { requireAdminAuth } from '@aotf/lib/admin-auth';

export async function POST(req: NextRequest) {
  return requireAdminAuth(req, async (request, admin) => {
    try {
      await connectToDatabase();

      // Parse and validate body
      const body: unknown = await req.json();
      if (!body || typeof body !== 'object' || !('applicationId' in body)) {
        return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
      }
      const applicationId = String((body as { applicationId: unknown }).applicationId);
      if (!applicationId) {
        return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
      }

      // Validate application exists and is in correct state
      const app = await Application.findById(applicationId);
      if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      if (app.status !== 'withdrawal-requested') {
        return NextResponse.json({ error: 'No pending withdrawal request for this application' }, { status: 400 });
      }

      // Update: set status back to pending and remove specified fields
      await Application.updateOne(
        { _id: applicationId },
        {
          $set: { status: 'pending' },
          $unset: {
            withdrawalNote: '',
            withdrawalRequestedAt: '',
            withdrawalRequestedBy: '',
          },
        }
      );

      // Update the notification status to declined
      await AdminNotification.updateOne(
        { applicationId: app._id, status: 'pending' },
        {
          $set: {
            status: 'declined',
            processedAt: new Date(),
            processedBy: admin.email || admin._id,
          }
        }
      );

      // Build minimal response without relying on lean typing
      return NextResponse.json({
        success: true,
        application: { _id: applicationId, status: 'pending' },
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { error: 'Failed to decline withdrawal', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  });
}
