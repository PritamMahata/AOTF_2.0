import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Ad from '@aotf/models/Ad';
import AdAnalytics from '@aotf/models/AdAnalytics';
import mongoose from 'mongoose';

// Define a type for lean Ad documents
interface LeanAd {
  _id: string | mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  link: string;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  startDate?: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

function isLeanAd(ad: unknown): ad is LeanAd {
  if (!ad || typeof ad !== 'object') return false;
  const obj = ad as Record<string, unknown>;
  return (
    'title' in obj &&
    'impressions' in obj &&
    'clicks' in obj &&
    'status' in obj
  );
}

// GET /api/ad/analytics?adId=xxx&days=7
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/ad/analytics]';
  try {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');
    const days = parseInt(searchParams.get('days') || '7', 10);

    await connectToDatabase();

    // If adId is provided, get analytics for that specific ad
    if (adId) {
      const adRaw = await Ad.findById(adId).lean();
      if (!adRaw) {
        return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
      }
      const ad = adRaw as unknown as LeanAd;

      // Get daily analytics for the past N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Ensure adId is ObjectId for AdAnalytics query
      let adObjectId: mongoose.Types.ObjectId;
      try {
        adObjectId = new mongoose.Types.ObjectId(adId);
      } catch {
        return NextResponse.json({ error: 'Invalid adId' }, { status: 400 });
      }

      const dailyAnalytics = await AdAnalytics.find({
        adId: adObjectId,
        date: { $gte: startDate }
      })
        .sort({ date: 1 })
        .lean();

      // Calculate CTR as number
      const ctr = ad.impressions > 0 
        ? (ad.clicks / ad.impressions) * 100 
        : 0;

      return NextResponse.json({
        success: true,
        ad: {
          _id: ad._id,
          title: ad.title,
          status: ad.status,
          impressions: ad.impressions,
          clicks: ad.clicks,
          ctr: Number(ctr.toFixed(2)),
          startDate: ad.startDate,
          endDate: ad.endDate,
        },
        dailyAnalytics: dailyAnalytics.map(analytics => ({
          date: analytics.date,
          impressions: analytics.impressions,
          clicks: analytics.clicks,
          ctr: analytics.impressions > 0 
            ? Number(((analytics.clicks / analytics.impressions) * 100).toFixed(2))
            : 0
        }))
      });
    }

    // Get analytics for all ads
    const adsRaw = await Ad.find().lean();
    // Use type guard to filter only valid LeanAd objects
    const analyticsData = (Array.isArray(adsRaw) ? adsRaw : []).filter(isLeanAd).map((leanAd) => {
      const ctr = leanAd.impressions > 0 
        ? (leanAd.clicks / leanAd.impressions) * 100 
        : 0;
      return {
        _id: leanAd._id,
        title: leanAd.title,
        status: leanAd.status,
        impressions: leanAd.impressions,
        clicks: leanAd.clicks,
        ctr: Number(ctr.toFixed(2)),
        startDate: leanAd.startDate,
        endDate: leanAd.endDate,
        createdAt: leanAd.createdAt,
      };
    });

    // Calculate totals
    const totals = analyticsData.reduce((acc, leanAd) => ({
      impressions: acc.impressions + leanAd.impressions,
      clicks: acc.clicks + leanAd.clicks,
    }), { impressions: 0, clicks: 0 });

    const overallCTR = totals.impressions > 0
      ? Number(((totals.clicks / totals.impressions) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      success: true,
      totals: {
        ...totals,
        ctr: overallCTR,
        totalAds: analyticsData.length,
        activeAds: analyticsData.filter(a => a.status === 'active').length,
      },
      ads: analyticsData
    });
  } catch (error) {
    console.error(logPrefix, 'Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
