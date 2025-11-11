import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = getAuthTokenFromCookies(request.cookies);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { role } = await request.json();
    if (role !== 'teacher' && role !== 'guardian') {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error setting role:', error);
    }
    return NextResponse.json({ success: false, error: 'Failed to set role' }, { status: 500 });
  }
} 