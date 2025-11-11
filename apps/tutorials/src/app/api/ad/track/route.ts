import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';
import AdAnalytics from '@aotf/models/AdAnalytics';

// POST /api/ad/track - Track impression or click
export async function POST(req: NextRequest) {
  const logPrefix = '[POST /api/ad/track]';
  
  try {
    const { adId, type } = await req.json();
    
    console.log(logPrefix, 'Tracking event:', { adId, type });
    
    if (!adId || !type || !['impression', 'click'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide adId and type (impression/click)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update the ad's total counters
    const updateField = type === 'impression' ? 'impressions' : 'clicks';
    const ad = await Ad.findByIdAndUpdate(
      adId,
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Update daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await AdAnalytics.findOneAndUpdate(
      { adId, date: today },
      { $inc: { [updateField]: 1 } },
      { upsert: true, new: true }
    );

    console.log(logPrefix, `${type} tracked for ad:`, adId);

    return NextResponse.json({ 
      success: true, 
      message: `${type} tracked successfully`,
      [updateField]: ad[updateField]
    });
  } catch (error) {
    console.error(logPrefix, 'Error tracking ad event:', error);
    return NextResponse.json(
      { error: 'Failed to track ad event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
