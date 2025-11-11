import { NextResponse } from 'next/server';

/**
 * /api/auth/me - Disabled on Main App
 * 
 * The main app (aotf.in) does NOT handle authentication or sessions.
 * User authentication is managed by the sub-apps:
 * - tutorials.aotf.in - for teachers and guardians
 * - jobs.aotf.in - for freelancers and clients
 * 
 * This endpoint returns 410 (Gone) to indicate that authentication
 * is not available on the main app.
 */
export async function GET() {
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in';
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in';
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Authentication is not available on the main app. Please use the appropriate sub-app.',
      message: 'The main app only handles signup and routing. For authentication, please visit:',
      apps: {
        tutorials: `${tutorialsUrl}/api/auth/session`,
        jobs: `${jobsUrl}/api/auth/session`
      }
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
