import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import { verifyToken } from '@aotf/lib/auth-utils';
import { clearAuthCookie } from '@aotf/lib/auth-token';

// DELETE /api/auth/cancel-registration - Cancel user registration and delete account
export async function DELETE(req: NextRequest) {
  const logPrefix = '[DELETE /api/auth/cancel-registration]';

  try {
    console.log(logPrefix, 'User cancelling registration');

    // Verify authentication
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      console.log(logPrefix, 'No authentication token found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized. Please login.' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.log(logPrefix, 'Invalid token');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }

    await connectToDatabase();

    // Get user details
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log(logPrefix, 'User not found');
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if user has completed onboarding
    if (user.onboardingCompleted) {
      console.log(logPrefix, 'User has completed onboarding, cannot cancel registration');
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot cancel registration after completing onboarding. Please contact support to delete your account.' 
      }, { status: 400 });
    }

    // Delete the user
    await User.findByIdAndDelete(decoded.id);

    console.log(logPrefix, 'User deleted successfully:', user.email);

    // Create response and clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration cancelled and account deleted successfully',
    });

    // Clear the auth token cookie
    clearAuthCookie(response);

    return response;

  } catch (error) {
    console.error(logPrefix, 'Error cancelling registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel registration. Please try again.' 
      },
      { status: 500 }
    );
  }
}
