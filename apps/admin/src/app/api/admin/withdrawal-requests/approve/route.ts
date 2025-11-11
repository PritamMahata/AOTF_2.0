import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import AdminNotification from '@aotf/models/AdminNotification';
import Post from '@aotf/models/Post';
import mongoose from 'mongoose';
import { requireAdminAuth } from '@aotf/lib/admin-auth';

export async function POST(req: NextRequest) {
  return requireAdminAuth(req, async () => {
    await connectToDatabase();
    const { applicationId } = await req.json();
    if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    const app = await Application.findById(applicationId);
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    if (app.status !== 'withdrawal-requested') return NextResponse.json({ error: 'Not a withdrawal request' }, { status: 400 });

    // Remove teacher from post's applicants array
    const teacherObjId = typeof app.teacherId === 'string' ? new mongoose.Types.ObjectId(app.teacherId) : app.teacherId;
    await Post.updateOne(
      { _id: app.postId },
      { $pull: { applicants: teacherObjId } }
    );

    // Update the notification status to approved
    await AdminNotification.updateOne(
      { applicationId: app._id, status: 'pending' },
      {
        $set: {
          status: 'approved',
          processedAt: new Date(),
        }
      }
    );

    await app.deleteOne();
    return NextResponse.json({ success: true });
  });
}
