import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import Post from '@aotf/models/Post';
import Teacher from '@aotf/models/Teacher';

// GET /api/admin/applications/all - Fetch all applications across all posts
export async function GET() {
  const logPrefix = '[GET /api/admin/applications/all]';
  
  try {
    console.log(logPrefix, 'Fetching all applications');

    await connectToDatabase();

    // Find all applications and populate teacher details
    const applications = await Application.find({})
      .populate({
        path: 'teacherId',
        model: Teacher,
        select: 'teacherId name email phone location experience qualifications subjectsTeaching teachingMode bio hourlyRate availability rating totalGuardians avatar whatsappNumber',
      })
      .populate({
        path: 'postId',
        model: Post,
        select: 'postId subject class board location guardianId',
      })
      .sort({ appliedAt: -1 }) // Sort by most recent first
      .lean();

    console.log(logPrefix, `Found ${applications.length} applications`);

    // Format the response to include teacher and post details
    const result = applications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      teacher: app.teacherId, // Populated teacher object
      postId: app.postId?._id ? String(app.postId._id) : app.postId,
      post: app.postId && typeof app.postId === 'object' ? {
        postId: app.postId.postId,
        subject: app.postId.subject,
        class: app.postId.class,
        board: app.postId.board,
      } : null,
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
