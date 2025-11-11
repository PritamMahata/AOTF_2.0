import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';

/**
 * GET /api/ad/sync-status
 * 
 * Manually triggers ad status synchronization based on server time.
 * This can be called periodically by a cron job or manually by admins.
 * 
 * This endpoint ensures all ads have correct status based on:
 * - Current server time
 * - Start dates (activates scheduled ads)
 * - End dates (expires active ads)
 */
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get current server time
    const serverTime = new Date();
    
    // Update all ad statuses based on server time
    await Ad.updateAllAdStatuses();
    
    // Get summary of ad statuses after update
    const statusCounts = await Ad.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const summary = {
      serverTime: serverTime.toISOString(),
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return NextResponse.json({
      success: true,
      message: 'Ad statuses synchronized successfully',
      ...summary
    });
  } catch (error) {
    console.error('Error syncing ad statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync ad statuses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ad/sync-status
 * 
 * Same as GET but can be used for webhook-based cron jobs that require POST.
 */
export async function POST() {
  return GET();
}
