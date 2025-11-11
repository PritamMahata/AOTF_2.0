import { NextResponse } from 'next/server';

/**
 * Onboarding Complete - Disabled on Main App
 * 
 * Onboarding is handled by the sub-apps (Tutorials or Jobs).
 * This endpoint is not available on the main app.
 */
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Onboarding is not available on the main app. Complete onboarding on your chosen platform (Tutorials or Jobs).'
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
