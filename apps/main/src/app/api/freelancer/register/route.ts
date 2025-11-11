import { NextResponse } from 'next/server';

/**
 * Freelancer Registration - Moved to Jobs App
 * 
 * Freelancer registration is handled on jobs.aotf.in
 * This endpoint is not available on the main app.
 */
export async function POST() {
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in';
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Freelancer registration is not available on the main app.',
      message: `Please visit ${jobsUrl} and complete your onboarding there.`,
      redirectTo: `${jobsUrl}/login`
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
