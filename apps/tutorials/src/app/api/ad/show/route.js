import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Update all ad statuses based on server time before fetching
    await Ad.updateAllAdStatuses();
    
    // Only return active ads
    const ads = await Ad.find({ status: 'active' }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 });
  }
}
