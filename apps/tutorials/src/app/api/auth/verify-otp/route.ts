import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@aotf/lib/email';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const email = (body?.email || '').toLowerCase().trim();
    const code = (body?.code || '').trim();
    
    if (!email || code.length !== 6) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const otpHash = hashOtp(code);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[verify-otp] Input code:', code);
      console.log('[verify-otp] Computed hash:', otpHash);
      console.log('[verify-otp] Stored hash:', user.emailVerification?.otpHash);
      console.log('[verify-otp] Expires at:', user.emailVerification?.otpExpiresAt);
      console.log('[verify-otp] Current time:', now);
    }

    if (!user.emailVerification || !user.emailVerification.otpHash || !user.emailVerification.otpExpiresAt) {
      return NextResponse.json({ success: false, error: 'No code requested' }, { status: 400 });
    }
    if (user.emailVerification.otpExpiresAt < now) {
      return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 });
    }
    if (user.emailVerification.otpHash !== otpHash) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
    }

    user.emailVerification.verified = true;
    user.emailVerification.otpHash = undefined;
    user.emailVerification.otpExpiresAt = undefined;
    await user.save();

    // Send welcome email only once per user
    if (!user.emailVerification.welcomeSent) {
      // Fire-and-forget; gate with welcomeSent flag
      (async () => {
        try {
          const userType = (user.role as 'teacher' | 'guardian') || 'teacher';
          const userName = user.name || user.email.split('@')[0] || 'there';
          await sendWelcomeEmail(user.email, userType, userName);
          const ev = user.emailVerification || { verified: true, welcomeSent: false };
          ev.welcomeSent = true;
          user.emailVerification = ev;
          await user.save();
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[verify-otp] sendWelcomeEmail failed:', (err as Error).message);
          }
        }
      })();
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[verify-otp] error:', (e as Error).message);
    }
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}