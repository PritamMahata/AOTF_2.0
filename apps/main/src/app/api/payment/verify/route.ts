import { NextResponse } from 'next/server';

/**
 * Payment Verification - Moved to Sub-Apps
 * 
 * Payment verification is handled on the respective sub-apps:
 * - tutorials.aotf.in (for teachers)
 * - jobs.aotf.in (for freelancers)
 * 
 * This endpoint is not available on the main app.
 */
export async function POST() {
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in';
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in';
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Payment verification is not available on the main app.',
      message: 'Please complete payment verification on your chosen platform.',
      apps: {
        tutorials: tutorialsUrl,
        jobs: jobsUrl
      }
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
