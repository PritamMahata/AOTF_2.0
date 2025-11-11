import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import Freelancer from '@aotf/models/Freelancer';
import Application from '@aotf/models/Application';
import Post from '@aotf/models/Post';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const freelancer = await Freelancer.findOne({ email: user.email.toLowerCase() });
    
    if (!freelancer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Freelancer profile not found' 
      }, { status: 404 });
    }

    // Find all applications by this freelancer
    const applications = await Application.find({ 
      freelancerId: freelancer.freelancerId 
    })
    .sort({ createdAt: -1 })
    .populate('postId');

    // Fetch full post details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const post = await Post.findOne({ postId: app.postId });
        return {
          _id: app._id,
          postId: app.postId,
          status: app.status,
          message: app.message,
          appliedAt: app.createdAt,
          post: post ? {
            subject: post.subject,
            className: post.className,
            category: post.category,
            description: post.description,
            budgetAmount: post.budgetAmount,
            budgetRangeMin: post.budgetRangeMin,
            budgetRangeMax: post.budgetRangeMax,
            urgency: post.urgency,
            status: post.status,
          } : null
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      applications: applicationsWithDetails 
    });
  } catch (error) {
    console.error('Error fetching freelancer applications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    }, { status: 500 });
  }
}
