import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';

// NOTE: For simplicity we accept the payload as JSON. If you enable signature
// verification later, you may need access to the raw body to compute HMAC.

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const type: string = payload.type || payload.event || '';
    const data = payload.data || payload.payload || payload;

    // Attempt to extract recipient emails in a resilient way
    let recipients: string[] = [];
    const toField = data?.to ?? payload?.to;
    if (Array.isArray(toField)) {
      recipients = toField;
    } else if (typeof toField === 'string') {
      recipients = [toField];
    } else if (typeof data?.recipient === 'string') {
      recipients = [data.recipient];
    }
    recipients = recipients.map((e) => String(e).toLowerCase().trim()).filter(Boolean);

    const reason: string | undefined = data?.bounce?.reason || data?.reason || data?.error || undefined;
    const occurredAt = new Date(data?.created_at || payload?.created_at || Date.now());

    if (!type || recipients.length === 0) {
      // Nothing actionable
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (type === 'email.bounced' || type === 'email.delivery_bounced' || type === 'email.hard_bounced' || type === 'email.soft_bounced') {
      await User.updateMany(
        { email: { $in: recipients } },
        {
          $set: {
            'emailStatus.bounced': true,
            'emailStatus.bouncedAt': occurredAt,
            'emailStatus.bounceReason': reason,
          },
        }
      );
    }

    // If later a delivery succeeds for the same address, clear the flag
    if (type === 'email.delivered') {
      await User.updateMany(
        { email: { $in: recipients } },
        {
          $set: { 'emailStatus.bounced': false },
          $unset: { 'emailStatus.bouncedAt': '', 'emailStatus.bounceReason': '' },
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[resend-webhook] error:', (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  // Simple health check endpoint
  return NextResponse.json({ ok: true });
}
