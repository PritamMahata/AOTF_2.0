import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';

// GET /api/auth/email-status?email=foo@example.com
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = (searchParams.get('email') || '').toLowerCase().trim();
    if (!emailParam) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: emailParam });
    if (!user) {
      return NextResponse.json({ success: true, found: false, bounced: false });
    }

    const bounced = Boolean(user.emailStatus?.bounced);
    const reason = user.emailStatus?.bounceReason || null;
    const bouncedAt = user.emailStatus?.bouncedAt || null;

    return NextResponse.json({ success: true, found: true, bounced, reason, bouncedAt });
  } catch (e) {
    console.error('[email-status] error:', (e as Error).message);
    return NextResponse.json({ success: false, error: 'Failed to retrieve status' }, { status: 500 });
  }
}
