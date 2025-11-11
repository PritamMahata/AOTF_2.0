import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';

// GET: List all ads (active and inactive) with auto-expiration check based on server time
export async function GET() {
  try {
    await connectToDatabase();
    
    // Auto-update ad statuses based on server time
    await Ad.updateAllAdStatuses();
    
    const ads = await Ad.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// POST: Create a new ad
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { title, imageUrl, link, status, startDate, endDate } = await request.json();
    if (!title || !imageUrl || !link) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const adData: Record<string, unknown> = { title, imageUrl, link };
    const now = new Date();
    
    // Parse dates
    if (startDate) adData.startDate = new Date(startDate);
    if (endDate) adData.endDate = new Date(endDate);
    
    // Determine initial status based on server time
    let initialStatus = status || 'active';
    
    if (startDate && new Date(startDate) > now) {
      // If start date is in the future, set as scheduled
      initialStatus = 'scheduled';
    } else if (endDate && new Date(endDate) < now) {
      // If end date has already passed, set as expired
      initialStatus = 'expired';
    } else if (status) {
      // Use provided status
      initialStatus = status;
    }
    
    adData.status = initialStatus;
    
    const ad = new Ad(adData);
    await ad.save();
    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ad' }, { status: 500 });
  }
}

// PATCH: Update an ad
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const { id, title, imageUrl, link, status, startDate, endDate } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ad id' }, { status: 400 });
    }
    
    // First, get the existing ad to check current values
    const existingAd = await Ad.findById(id);
    if (!existingAd) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (link) updateData.link = link;
    
    // Determine the final dates (use new if provided, otherwise keep existing)
    const finalStartDate = startDate !== undefined 
      ? (startDate ? new Date(startDate) : null) 
      : existingAd.startDate;
    const finalEndDate = endDate !== undefined 
      ? (endDate ? new Date(endDate) : null) 
      : existingAd.endDate;
    
    // Update dates in updateData
    if (startDate !== undefined) updateData.startDate = finalStartDate;
    if (endDate !== undefined) updateData.endDate = finalEndDate;
    
    // Smart status determination based on server time
    const now = new Date();
    let newStatus = status || existingAd.status;
    
    // If user is manually setting status to 'inactive', respect that
    if (status === 'inactive') {
      newStatus = 'inactive';
    } else {
      // Auto-determine status based on dates and current server time
      if (finalEndDate && finalEndDate < now) {
        // End date has passed - must be expired
        newStatus = 'expired';
      } else if (finalStartDate && finalStartDate > now) {
        // Start date is in future - must be scheduled (unless manually set to inactive)
        newStatus = 'scheduled';
      } else if (finalStartDate && finalStartDate <= now && (!finalEndDate || finalEndDate >= now)) {
        // Start date has arrived and end date hasn't passed - should be active
        // Only set to active if it's not manually set to inactive
        if (existingAd.status !== 'inactive' && status !== 'inactive') {
          newStatus = 'active';
        }
      } else if (!finalStartDate && !finalEndDate) {
        // No dates set - keep as active unless manually set otherwise
        if (newStatus === 'expired' || newStatus === 'scheduled') {
          newStatus = 'active';
        }
      } else if (!finalStartDate && finalEndDate && finalEndDate >= now) {
        // Only end date set and hasn't passed - should be active
        if (existingAd.status !== 'inactive' && status !== 'inactive') {
          newStatus = 'active';
        }
      }
    }
    
    updateData.status = newStatus;
    
    const ad = await Ad.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    if (!ad) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ad' }, { status: 500 });
  }
}

// DELETE: Delete an ad
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ad id' }, { status: 400 });
    }
    const ad = await Ad.findByIdAndDelete(id);
    if (!ad) {
      return NextResponse.json({ success: false, error: 'Ad not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete ad' }, { status: 500 });
  }
}
