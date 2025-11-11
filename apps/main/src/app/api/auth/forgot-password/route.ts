import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const email = (body?.email || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists to prevent user enumeration
      return NextResponse.json({ success: true, sent: true });
    }

    // Generate OTP and its hash
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Throttle resends: block if last set < 30s ago
    const duplicateWindowThreshold = new Date(Date.now() + (10 * 60 * 1000 - 30 * 1000));

    const updateResult = await User.updateOne(
      {
        _id: user._id,
        $or: [
          { 'passwordReset.otpExpiresAt': { $exists: false } },
          { 'passwordReset.otpExpiresAt': { $lte: duplicateWindowThreshold } }
        ]
      },
      {
        $set: {
          'passwordReset.otpHash': otpHash,
          'passwordReset.otpExpiresAt': expires
        }
      }
    );

    if (!updateResult.modifiedCount) {
      // Recently sent; respond success silently
      return NextResponse.json({ success: true, sent: true, message: 'Reset code already sent recently' });
    }

    try {
      const userName = user.name || undefined;
      await sendPasswordResetEmail(email, otp, userName);
    } catch (e) {
      console.error('[forgot-password] email send failed:', (e as Error).message);
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, sent: true, code: otp });
    }

    return NextResponse.json({ success: true, sent: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[forgot-password] error:', (e as Error).message);
    }
    return NextResponse.json({ success: false, error: 'Failed to start password reset' }, { status: 500 });
  }
}
