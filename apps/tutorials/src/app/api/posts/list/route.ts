import { NextRequest, NextResponse } from 'next/server';
import Post from '@aotf/models/Post';
import connectToDatabase from '@aotf/lib/mongodb';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error ?? 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const { user, guardian } = authResult;
    const lookupConditions: Array<Record<string, unknown>> = [];

    lookupConditions.push({ userId: user.id });

    if (user.email) {
      const email = user.email.trim();
      if (email) {
        const normalisedEmail = email.toLowerCase();
        lookupConditions.push({ userId: email });
        lookupConditions.push({ email });
        if (normalisedEmail !== email) {
          lookupConditions.push({ email: normalisedEmail });
        }
      }
    }

    if (guardian && typeof guardian === 'object') {
      const guardianId = (guardian as { guardianId?: string })?.guardianId;
      if (guardianId) {
        lookupConditions.push({ guardianId });
      }
    }

    // Support legacy records which may have been stored against email or guardianId instead of the userId
    const query = lookupConditions.length > 1 ? { $or: lookupConditions } : lookupConditions[0];

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, posts });
  } catch (e) {
    console.error('Get user posts API error:', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}