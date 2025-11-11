import { NextResponse } from 'next/server';

/**
 * NextAuth Disabled on Main App
 * 
 * The main app (aotf.in) only handles signup and routing.
 * Authentication and sessions are managed by sub-apps:
 * - tutorials.aotf.in - for teachers and guardians
 * - jobs.aotf.in - for freelancers and clients
 * 
 * Each sub-app has its own isolated NextAuth instance with
 * subdomain-specific cookies to prevent cross-app session sharing.
 */

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Authentication is not available on the main app. Please use tutorials.aotf.in or jobs.aotf.in' 
  }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'Authentication is not available on the main app. Please use tutorials.aotf.in or jobs.aotf.in' 
  }, { status: 410 });
}
