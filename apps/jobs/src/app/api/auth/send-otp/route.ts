import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import crypto from 'crypto';
import { sendOTPEmail } from '@aotf/lib/email';

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
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // If previous delivery attempts bounced, block and instruct user
    if (user.emailStatus?.bounced) {
      return NextResponse.json(
        {
          success: false,
          error:
            'We could not deliver emails to this address previously (bounced). Please sign up with a valid email address.'
        },
        { status: 400 }
      );
    }

    // Generate the OTP up front; we'll only persist/send it if we win the atomic update below
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Atomic deduplication window based on otpExpiresAt
    // If an OTP was set less than 30s ago, prevent updating (and therefore prevent sending another email)
    const duplicateWindowThreshold = new Date(Date.now() + (10 * 60 * 1000 - 30 * 1000)); // now + 9m30s

    const updateResult = await User.updateOne(
      {
        _id: user._id,
        $or: [
          { 'emailVerification.otpExpiresAt': { $exists: false } },
          { 'emailVerification.otpExpiresAt': { $lte: duplicateWindowThreshold } }
        ]
      },
      {
        $set: {
          'emailVerification.verified': false,
          'emailVerification.otpHash': otpHash,
          'emailVerification.otpExpiresAt': expires
        }
      }
    );

    if (!updateResult.modifiedCount) {
      // Another concurrent request already set a fresh OTP within the last 30s
      if (process.env.NODE_ENV === 'development') {
        console.log('[send-otp] Duplicate blocked by atomic update');
      }
      return NextResponse.json({ success: true, sent: true, message: 'OTP already sent recently' });
    }

    // We "won" the update — proceed to send the email with the freshly stored OTP
    if (process.env.NODE_ENV === 'development') {
      console.log('[send-otp] Generated OTP:', otp);
      console.log('[send-otp] OTP Hash:', otpHash);
      console.log('[send-otp] Expires at:', expires);
    }

    try {
      const userType = user.role || 'teacher';
      const userName = user.name || undefined;
      await sendOTPEmail(email, otp, userType, userName);
    } catch (e) {
      console.error('[send-otp] email send failed:', (e as Error).message);
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      // In development, also return the OTP code for easier testing
      return NextResponse.json({ success: true, sent: true, code: otp });
    }

    return NextResponse.json({ success: true, sent: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[send-otp] error:', (e as Error).message);
    }
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 });
  }
}