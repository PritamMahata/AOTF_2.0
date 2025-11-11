import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Feedback from '@aotf/models/Feedback';
import { requireAdminAuth } from '@aotf/lib/admin-auth';

// GET /api/admin/feedback - Get all feedback (admin only)
export async function GET(req: NextRequest) {
  return requireAdminAuth(req, async () => {
    const logPrefix = '[GET /api/admin/feedback]';

    try {
      console.log(logPrefix, 'Admin fetching all feedback');
      await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const feedbackType = searchParams.get('type');

    // Build query
    const query: Record<string, unknown> = {};
    if (status && ['pending', 'reviewed', 'resolved'].includes(status)) {
      query.status = status;
    }
    if (feedbackType && ['bug', 'feature', 'improvement', 'general'].includes(feedbackType)) {
      query.feedbackType = feedbackType;
    }

    // Fetch all feedback
      const feedbacks = await Feedback.find(query)
        .sort({ createdAt: -1 })
        .lean();

      console.log(logPrefix, `Found ${feedbacks.length} feedback entries`);

      return NextResponse.json({
        success: true,
        feedbacks,
        count: feedbacks.length,
      });

    } catch (error) {
      console.error(logPrefix, 'Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/admin/feedback - Update feedback status or add admin response
export async function PATCH(req: NextRequest) {
  return requireAdminAuth(req, async () => {
    const logPrefix = '[PATCH /api/admin/feedback]';

    try {
      console.log(logPrefix, 'Updating feedback');
      await connectToDatabase();

      const body = await req.json();
      const { feedbackId, status, adminResponse } = body;

      if (!feedbackId) {
        return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status && ['pending', 'reviewed', 'resolved'].includes(status)) {
      updateData.status = status;
    }
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse.trim();
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    );

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

      console.log(logPrefix, 'Feedback updated successfully:', feedbackId);

      return NextResponse.json({
        success: true,
        message: 'Feedback updated successfully',
        feedback,
      });

    } catch (error) {
      console.error(logPrefix, 'Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }
  });
}