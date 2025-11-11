import { NextResponse } from 'next/server';

/**
 * Teacher Registration - Moved to Tutorials App
 * 
 * Teacher registration is handled on tutorials.aotf.in
 * This endpoint is not available on the main app.
 */
export async function POST() {
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in';
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Teacher registration is not available on the main app.',
      message: `Please visit ${tutorialsUrl} and complete your onboarding there.`,
      redirectTo: `${tutorialsUrl}/login`
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
