import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import Post from '@aotf/models/Post';
import Teacher from '@aotf/models/Teacher'; // Import Teacher model for population
import mongoose from 'mongoose';

// GET /api/application/list?postId=...
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/application/list]';
  
  try {
    const { searchParams } = new URL(req.url);
    let postId = searchParams.get('postId');

    console.log(logPrefix, 'Request for postId:', postId);

    if (!postId) {
      console.error(logPrefix, 'Missing postId parameter');
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    await connectToDatabase();

    // If postId is not a valid ObjectId, treat it as a custom postId and look up the real _id
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log(logPrefix, 'postId is custom format, looking up Post document...');
      const post = await Post.findOne({ postId }).lean();
      if (!post) {
        console.warn(logPrefix, 'Post not found for postId:', postId);
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      console.log(logPrefix, 'Found post with _id:', post._id);
      postId = String(post._id);
    }

    // Find applications for the given postId and populate teacher details
    console.log(logPrefix, 'Fetching applications for postId (ObjectId):', postId);
    const applications = await Application.find({ postId })
      .populate({
        path: 'teacherId',
        model: Teacher, // Use imported model instead of string
        select: 'teacherId name email phone location experience qualifications subjectsTeaching teachingMode bio hourlyRate availability rating totalGuardians avatar whatsappNumber',
      })
      .lean();

    console.log(logPrefix, `Found ${applications.length} applications`);

    // Format the response to include teacher details
    const result = applications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      teacher: app.teacherId, // Populated teacher object
      postId: app.postId,
    }));

    console.log(logPrefix, 'Returning applications:', result.length);
    return NextResponse.json({ applications: result });
  } catch (error) {
    console.error(logPrefix, 'Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
