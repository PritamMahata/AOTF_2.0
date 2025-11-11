import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import crypto from 'crypto';
import { clearAuthCookie } from '@aotf/lib/auth-token';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const email = (body?.email || '').toLowerCase().trim();
    const code = (body?.code || '').trim();
    const newPassword = String(body?.newPassword || '');
    const confirmPassword = String(body?.confirmPassword || '');

    if (!email || code.length !== 6) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Hide existence
      return NextResponse.json({ success: false, error: 'Invalid code or expired' }, { status: 400 });
    }

    const now = new Date();
    const otpHash = hashOtp(code);

    if (!user.passwordReset || !user.passwordReset.otpHash || !user.passwordReset.otpExpiresAt) {
      return NextResponse.json({ success: false, error: 'No reset requested' }, { status: 400 });
    }
    if (user.passwordReset.otpExpiresAt < now) {
      return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 });
    }
    if (user.passwordReset.otpHash !== otpHash) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
    }

    // Update password; pre-save hook will hash
    user.password = newPassword;
    // Clear password reset fields
    user.passwordReset.otpHash = undefined;
    user.passwordReset.otpExpiresAt = undefined;
    await user.save();

    // Clear any existing auth cookie (in case they were logged in) to force fresh login
    const response = NextResponse.json({ success: true, message: 'Password has been reset' });
    clearAuthCookie(response);

    return response;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[reset-password] error:', (e as Error).message);
    }
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 });
  }
}
