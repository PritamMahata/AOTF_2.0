import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';
import DeclinedApplication from '@aotf/models/DeclinedApplication';
import Post from '@aotf/models/Post';

// PATCH /api/application/status
export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const { applicationId, status } = await req.json();

  if (!applicationId || !status) {
    return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
  }

  // Only allow valid status values
  if (!['pending', 'approved', 'declined', 'accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  // Map UI status to model status
  let dbStatus = status;
  if (status === 'approved') dbStatus = 'approved';
  if (status === 'declined') dbStatus = 'declined';

  const application = await Application.findById(applicationId);
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // If approving an application, auto-decline all other pending applications for the same post
  if (dbStatus === 'approved') {
    try {
      // Get the post details for the decline message
      const post = await Post.findById(application.postId);
      const postTitle = post ? `${post.subject} - ${post.className}` : 'the tuition post';
      const postIdForLink = post?.postId || '';
      
      // Find all other pending applications for the same post
      const otherApplications = await Application.find({
        postId: application.postId,
        _id: { $ne: applicationId },
        status: 'pending'
      });

      console.log(`[Auto-Decline] Found ${otherApplications.length} other pending applications to decline`);

      // Auto-decline reason with special marker for postId link
      // Format: [LINK:postId:displayText] will be parsed and rendered as a clickable link
      const autoDeclineReason = `Another applicant who applied earlier has been approved for [LINK:${postIdForLink}:${postTitle}]. Unfortunately, we cannot proceed with your application at this time.`;

      // Move other applications to DeclinedApplication collection and delete from Application
      for (const otherApp of otherApplications) {
        // Create a copy in DeclinedApplication collection
        await DeclinedApplication.create({
          originalApplicationId: otherApp._id,
          postId: otherApp.postId,
          teacherId: otherApp.teacherId,
          status: 'declined',
          appliedAt: otherApp.appliedAt,
          declinedAt: new Date(),
          declineReason: autoDeclineReason,
          autoDeclined: true,
          withdrawalRequestedAt: otherApp.withdrawalRequestedAt,
          withdrawalRequestedBy: otherApp.withdrawalRequestedBy,
          withdrawalApprovedAt: otherApp.withdrawalApprovedAt,
          withdrawalApprovedBy: otherApp.withdrawalApprovedBy,
          withdrawalRejectedAt: otherApp.withdrawalRejectedAt,
          withdrawalRejectedBy: otherApp.withdrawalRejectedBy,
          withdrawalNote: otherApp.withdrawalNote,
        });

        console.log(`[Auto-Decline] Moved application ${otherApp._id} to DeclinedApplication collection`);
      }

      // Delete the declined applications from the main Application collection
      await Application.deleteMany({
        postId: application.postId,
        _id: { $ne: applicationId },
        status: 'pending'
      });

      console.log(`[Auto-Decline] Deleted ${otherApplications.length} applications from Application collection`);

    } catch (error) {
      console.error('[Auto-Decline] Error auto-declining other applications:', error);
      // Continue with approving the main application even if auto-decline fails
    }
  }

  // Update the main application status
  application.status = dbStatus;
  await application.save();

  return NextResponse.json({ 
    success: true, 
    applicationId, 
    status: dbStatus,
    autoDeclinedCount: dbStatus === 'approved' ? await Application.countDocuments({
      postId: application.postId,
      status: 'declined',
      autoDeclined: true
    }) : 0
  });
}

