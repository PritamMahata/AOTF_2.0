import { NextResponse } from 'next/server';

/**
 * Main App Does NOT Handle Login
 * 
 * Users must login on the appropriate sub-app:
 * - Tutorials (tutorials.aotf.in) - for teachers and guardians
 * - Jobs (jobs.aotf.in) - for freelancers and clients
 * 
 * After signup on main app, users are redirected to choose-path page
 * where they select which platform to continue to.
 */

const message = 'Login is not available on the main app. Please login at tutorials.aotf.in or jobs.aotf.in';

export async function POST() {
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in';
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in';
  
  return NextResponse.json({ 
    success: false, 
    error: message,
    redirectOptions: {
      tutorials: `${tutorialsUrl}/login`,
      jobs: `${jobsUrl}/login`
    }
  }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
