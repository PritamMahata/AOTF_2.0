import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, clearAuthCookie } from '@aotf/lib/auth-token';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully'
    });
    
    // Clear the admin token cookie
    clearAuthCookie(response, ADMIN_COOKIE_NAME);
    
    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
