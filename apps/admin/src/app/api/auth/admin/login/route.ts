import { NextResponse } from 'next/server';

const message = 'This route has been replaced by NextAuth. Use POST /api/auth/[...nextauth] with the admin credentials provider.';

export async function POST() {
  return NextResponse.json({ success: false, error: message }, { status: 410 });
}
