import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import AdminNotification from '@aotf/models/AdminNotification';
import { requireAdminAuth } from '@aotf/lib/admin-auth';

// GET: Fetch all admin notifications with optional filters
export async function GET(req: NextRequest) {
  return requireAdminAuth(req, async () => {
    const logPrefix = '[GET /api/admin/notifications]';
    
    try {
      console.log(logPrefix, 'Request received');
      await connectToDatabase();
      console.log(logPrefix, 'Database connected');

      // Get query parameters for filtering
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status'); // pending, approved, declined, or 'all'
      const unreadOnly = searchParams.get('unreadOnly') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = parseInt(searchParams.get('skip') || '0');

    console.log(logPrefix, 'Query params:', { status, unreadOnly, limit, skip });

    // Build query
    const query: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (unreadOnly) {
      query.read = false;
    }

    console.log(logPrefix, 'MongoDB query:', query);

    // Fetch notifications
    const notifications = await AdminNotification.find(query)
      .populate('postId', 'postId guardianName subject location')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    console.log(logPrefix, 'Found notifications:', notifications.length);

    // Get total count for pagination
    const total = await AdminNotification.countDocuments(query);
    console.log(logPrefix, 'Total count:', total);

    // Map notifications for response
    const mappedNotifications = notifications.map((notif) => {
      const post = notif.postId && typeof notif.postId === 'object' && 'postId' in notif.postId
        ? {
            postId: String(notif.postId.postId || ''),
            guardianName: String((notif.postId as { guardianName?: string }).guardianName || ''),
            subject: String((notif.postId as { subject?: string }).subject || ''),
            location: String((notif.postId as { location?: string }).location || ''),
          }
        : null;

      return {
        _id: notif._id,
        type: notif.type,
        applicationId: notif.applicationId,
        teacherId: notif.teacherId,
        teacherName: notif.teacherName,
        teacherCustomId: notif.teacherCustomId,
        postDetails: post,
        withdrawalNote: notif.withdrawalNote,
        status: notif.status,
        requestedAt: notif.requestedAt,
        processedAt: notif.processedAt,
        processedBy: notif.processedBy,
        adminNote: notif.adminNote,
        createdAt: notif.createdAt,
        read: notif.read,
      };
    });

    console.log(logPrefix, 'Returning response with', mappedNotifications.length, 'notifications');

    return NextResponse.json({
      success: true,
      notifications: mappedNotifications,
      total,
      limit,
      skip,
    });
    } catch (error) {
      console.error('[GET /api/admin/notifications] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  });
}

// PATCH: Mark notifications as read
export async function PATCH(req: NextRequest) {
  return requireAdminAuth(req, async () => {
    try {
      await connectToDatabase();

      const { notificationIds, markAllAsRead } = await req.json();

      if (markAllAsRead) {
        // Mark all notifications as read
        await AdminNotification.updateMany(
          { read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Notification IDs required' }, { status: 400 });
      }

      // Mark specific notifications as read
      await AdminNotification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { read: true } }
      );

      return NextResponse.json({ 
        success: true, 
        message: `${notificationIds.length} notification(s) marked as read` 
      });
    } catch (error) {
      console.error('[PATCH /api/admin/notifications] Error:', error);
      return NextResponse.json(
        { error: 'Failed to update notifications', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  });
}
