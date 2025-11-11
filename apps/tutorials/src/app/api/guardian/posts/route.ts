import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post from '@aotf/models/Post';
import Guardian, { IGuardian } from '@aotf/models/Guardian';

/**
 * GET /api/guardian/posts
 * Fetch all posts created by a specific guardian
 * Query params: guardianId or email
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const guardianId = searchParams.get('guardianId');
    const email = searchParams.get('email');

    if (!guardianId && !email) {
      return NextResponse.json(
        { error: 'Either guardianId or email is required' },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {};

    // If guardianId is provided, use it directly
    if (guardianId) {
      query.guardianId = guardianId;
    }
    // If email is provided, first find the guardian
    else if (email) {
      const guardianDoc = await Guardian.findOne({ email: email.toLowerCase() });
      if (!guardianDoc) {
        return NextResponse.json(
          { error: 'Guardian not found', posts: [] },
          { status: 404 }
        );
      }
      query.guardianId = guardianDoc.guardianId;
    }

    // Find all posts by this guardian
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get guardian details
    const guardianDoc = await Guardian.findOne({ 
      guardianId: guardianId || (query.guardianId as string) 
    }).lean();
    const guardian: IGuardian | null = isGuardian(guardianDoc) ? guardianDoc : null;

    const formattedPosts = posts.map((post: Record<string, unknown>) => ({
      id: (post._id as { toString: () => string }).toString(),
      postId: post.postId as string,
      guardianId: post.guardianId as string,
      subject: post.subject as string,
      class: post.className as string,
      board: (post.board as string) || 'Not specified',
      budget: post.monthlyBudget ? `₹${post.monthlyBudget}/month` : 'Not specified',
      monthlyBudget: post.monthlyBudget as number,
      description: (post.notes as string) || 'No additional details',
      status: post.status as string,
      classType: post.classType as string,
      frequency: post.frequencyPerWeek as string,
      preferredTime: post.preferredTime as string,
      preferredDays: (post.preferredDays as string[]) || [],
      applicants: Array.isArray(post.applicants) ? post.applicants.length : 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      editedBy: post.editedBy as 'guardian' | 'admin' | 'teacher' | undefined,
      editedAt: post.editedAt as Date | undefined,
      editedByUserId: post.editedByUserId as string | undefined,
      editedByName: post.editedByName as string | undefined,
    }));

    return NextResponse.json({
      success: true,
      guardian: guardian ? {
        guardianId: guardian.guardianId,
        name: guardian.name,
        email: guardian.email,
        location: guardian.location
      } : null,
      totalPosts: formattedPosts.length,
      posts: formattedPosts
    });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    console.error('Error fetching guardian posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: message },
      { status: 500 }
    );
  }
}

function isGuardian(obj: unknown): obj is IGuardian {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'guardianId' in obj &&
    typeof (obj as IGuardian).guardianId === 'string' &&
    'email' in obj &&
    typeof (obj as IGuardian).email === 'string'
  );
}
