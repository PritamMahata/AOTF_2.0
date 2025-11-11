import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import DeclinedApplication from '@aotf/models/DeclinedApplication';
import Post from '@aotf/models/Post';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';

// GET /api/teacher/applications - Fetch all applications by the logged-in teacher
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/teacher/applications]';
  
  try {
    console.log(logPrefix, 'Fetching teacher applications...');

    // Authenticate and get teacher
    const authResult = await requireTeacherAuth(req);
    if (!authResult.success || !authResult.teacher) {
      console.error(logPrefix, 'Unauthorized:', authResult.error);
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const teacher = authResult.teacher;
    console.log(logPrefix, 'Found teacher:', (teacher as { teacherId: string }).teacherId);

    // Find all active applications by this teacher
    const applications = await Application.find({ teacherId: (teacher as { _id: unknown })._id })
      .populate({
        path: 'postId',
        model: Post,
        select: 'postId subject className board classType location monthlyBudget notes status preferredTime preferredDays frequencyPerWeek createdAt name email phone applicants',
      })
      .sort({ appliedAt: -1 }) // Most recent first
      .lean();

    // Find all declined applications by this teacher
    const declinedApplications = await DeclinedApplication.find({ teacherId: (teacher as { _id: unknown })._id })
      .populate({
        path: 'postId',
        model: Post,
        select: 'postId subject className board classType location monthlyBudget notes status preferredTime preferredDays frequencyPerWeek createdAt name email phone applicants',
      })
      .sort({ declinedAt: -1 }) // Most recent first
      .lean();

    console.log(logPrefix, `Found ${applications.length} active applications and ${declinedApplications.length} declined applications`);

    // Format the active applications response
    const activeApps = (applications as Array<Record<string, unknown>>).map((app) => ({
      _id: app._id,
      applicationId: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      declineReason: app.declineReason,
      autoDeclined: app.autoDeclined,
      withdrawalRequestedAt: app.withdrawalRequestedAt,
      withdrawalNote: app.withdrawalNote,
      post: app.postId ? {
        _id: (app.postId as Record<string, unknown>)._id,
        postId: (app.postId as Record<string, unknown>).postId,
        subject: (app.postId as Record<string, unknown>).subject,
        className: (app.postId as Record<string, unknown>).className,
        board: (app.postId as Record<string, unknown>).board,
        classType: (app.postId as Record<string, unknown>).classType,
        location: (app.postId as Record<string, unknown>).location,
        monthlyBudget: (app.postId as Record<string, unknown>).monthlyBudget,
        notes: (app.postId as Record<string, unknown>).notes,
        status: (app.postId as Record<string, unknown>).status,
        preferredTime: (app.postId as Record<string, unknown>).preferredTime,
        preferredDays: (app.postId as Record<string, unknown>).preferredDays,
        frequencyPerWeek: (app.postId as Record<string, unknown>).frequencyPerWeek,
        createdAt: (app.postId as Record<string, unknown>).createdAt,
        name: (app.postId as Record<string, unknown>).name,
        email: (app.postId as Record<string, unknown>).email,
        phone: (app.postId as Record<string, unknown>).phone,
        applicants: (app.postId as Record<string, unknown>).applicants,
      } : null,
    }));

    // Format the declined applications response
    const declinedApps = (declinedApplications as Array<Record<string, unknown>>).map((app) => ({
      _id: app._id,
      applicationId: app.originalApplicationId,
      status: app.status,
      appliedAt: app.appliedAt,
      declinedAt: app.declinedAt,
      declineReason: app.declineReason,
      autoDeclined: app.autoDeclined,
      withdrawalRequestedAt: app.withdrawalRequestedAt,
      withdrawalNote: app.withdrawalNote,
      post: app.postId ? {
        _id: (app.postId as Record<string, unknown>)._id,
        postId: (app.postId as Record<string, unknown>).postId,
        subject: (app.postId as Record<string, unknown>).subject,
        className: (app.postId as Record<string, unknown>).className,
        board: (app.postId as Record<string, unknown>).board,
        classType: (app.postId as Record<string, unknown>).classType,
        location: (app.postId as Record<string, unknown>).location,
        monthlyBudget: (app.postId as Record<string, unknown>).monthlyBudget,
        notes: (app.postId as Record<string, unknown>).notes,
        status: (app.postId as Record<string, unknown>).status,
        preferredTime: (app.postId as Record<string, unknown>).preferredTime,
        preferredDays: (app.postId as Record<string, unknown>).preferredDays,
        frequencyPerWeek: (app.postId as Record<string, unknown>).frequencyPerWeek,
        createdAt: (app.postId as Record<string, unknown>).createdAt,
        name: (app.postId as Record<string, unknown>).name,
        email: (app.postId as Record<string, unknown>).email,
        phone: (app.postId as Record<string, unknown>).phone,
        applicants: (app.postId as Record<string, unknown>).applicants,
      } : null,
    }));

    // Combine both arrays and sort by most recent
    const allApplications = [...activeApps, ...declinedApps].sort((a, b) => {
      const dateA = new Date(a.appliedAt as string).getTime();
      const dateB = new Date(b.appliedAt as string).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ 
      success: true, 
      applications: allApplications,
      teacher: {
        teacherId: (teacher as { teacherId: string }).teacherId,
        name: (teacher as { name: string }).name,
      }
    });

  } catch (error: unknown) {
    console.error(logPrefix, 'Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
