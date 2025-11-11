import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Settings from '@aotf/models/Settings';
import { requirePermission } from '@aotf/lib/admin-auth';

// Save or update settings (POST)
export async function POST(request: NextRequest) {
  return requirePermission(request, 'settings', async (req) => {
    try {
      await connectToDatabase();
      const body = await req.json();
      // Save all settings as a single document with key 'admin-settings'
      await Settings.findOneAndUpdate(
        { key: 'admin-settings' },
        { value: body },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
  });
}

// Get settings (GET)
export async function GET(request: NextRequest) {
  return requirePermission(request, 'settings', async () => {
    try {
      await connectToDatabase();
      const doc = await Settings.findOne({ key: 'admin-settings' });
      return NextResponse.json({ success: true, settings: doc?.value || {} });
    } catch (error) {
      return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
  });
}
