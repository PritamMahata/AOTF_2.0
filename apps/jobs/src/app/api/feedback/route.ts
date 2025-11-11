import { NextRequest, NextResponse } from 'next/server';
import  connectToDatabase  from '@aotf/lib/mongodb';
import Feedback from '@aotf/models/Feedback';
import User from '@aotf/models/User';
import { verifyToken } from '@aotf/lib/auth-utils';
import { validateFeedbackForm } from '@aotf/lib/validation';

// POST /api/feedback - Submit new feedback (authenticated users only)
export async function POST(req: NextRequest) {
  const logPrefix = '[POST /api/feedback]';

  try {    console.log(logPrefix, 'Submitting new feedback');

    // Verify authentication
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      console.log(logPrefix, 'No authentication token found');
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.log(logPrefix, 'Invalid token');
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user details
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      console.log(logPrefix, 'User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }    // Parse request body
    const body = await req.json();
    const { feedbackType, rating, subject, message } = body;

    // Validate using centralized validation
    const validation = validateFeedbackForm({
      feedbackType: feedbackType || '',
      rating: Number(rating) || 0,
      subject: subject || '',
      message: message || '',
    });

    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.errors[0] || 'Invalid feedback data',
        errors: validation.errors 
      }, { status: 400 });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      feedbackType,
      rating,
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending',
    });

    console.log(logPrefix, 'Feedback submitted successfully:', feedback._id);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      feedbackId: feedback._id,
    }, { status: 201 });

  } catch (error) {
    console.error(logPrefix, 'Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get user's feedback history (authenticated users)
export async function GET(req: NextRequest) {
  const logPrefix = '[GET /api/feedback]';

  try {    console.log(logPrefix, 'Fetching user feedback history');

    // Verify authentication
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch user's feedback
    const feedbacks = await Feedback.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    console.log(logPrefix, `Found ${feedbacks.length} feedback entries`);

    return NextResponse.json({
      success: true,
      feedbacks,
    });

  } catch (error) {
    console.error(logPrefix, 'Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback history' },
      { status: 500 }
    );
  }
}