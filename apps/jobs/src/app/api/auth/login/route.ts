import { NextResponse } from 'next/server';

const message = 'This route has been replaced by NextAuth. Use POST /api/auth/[...nextauth] with credentials provider.';

export async function POST() {
  return NextResponse.json({ success: false, error: message }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ success: false, error: message }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ success: false, error: message }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: message }, { status: 405 });
}
