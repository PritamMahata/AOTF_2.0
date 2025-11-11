import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';

// GET /api/ad/active - Get a random active ad to display (using server time)
export async function GET() {
  try {
    await connectToDatabase();
    
    // Update all ad statuses based on current server time
    await Ad.updateAllAdStatuses();
    
    const now = new Date();
    
    // Find active ads that are within their date range (or have no date restrictions)
    const activeAds = await Ad.find({
      status: 'active',
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    }).lean();
    
    if (activeAds.length === 0) {
      return NextResponse.json({ success: false, message: 'No active ads available' });
    }
    
    // Select a random ad
    const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
    
    return NextResponse.json({
      success: true,
      ad: {
        _id: randomAd._id,
        title: randomAd.title,
        imageUrl: randomAd.imageUrl,
        link: randomAd.link,
        status: randomAd.status,
      }
    });
  } catch (error) {
    console.error('Error fetching active ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active ad' },
      { status: 500 }
    );
  }
}
