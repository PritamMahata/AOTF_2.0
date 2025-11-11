import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post from '@aotf/models/Post';

// PATCH /api/posts/status
export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const { postId, status } = await req.json();

  if (!postId || !status) {
    return NextResponse.json({ error: 'Missing postId or status' }, { status: 400 });
  }

  // Only allow valid status values
  if (!['open', 'matched', 'closed', 'hold'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  // Store the status as-is (including 'hold')
  const dbStatus = status;

  // Support both custom postId and ObjectId
  let post;
  if (postId.length === 24) {
    post = await Post.findById(postId);
  } else {
    post = await Post.findOne({ postId });
  }
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  post.status = dbStatus;
  await post.save();

  return NextResponse.json({ success: true, postId, status: dbStatus });
}
