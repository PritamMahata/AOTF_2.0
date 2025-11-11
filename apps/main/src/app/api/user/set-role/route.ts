import { NextResponse } from 'next/server';

/**
 * Set Role - Disabled on Main App
 * 
 * User role assignment happens during onboarding on the sub-apps.
 * This endpoint is not available on the main app.
 */
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Role assignment is not available on the main app. Please complete onboarding on Tutorials or Jobs app.'
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
