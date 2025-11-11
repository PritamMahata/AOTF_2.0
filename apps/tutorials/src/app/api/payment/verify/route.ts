import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';
import User from '@aotf/models/User';
import crypto from 'crypto';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

// Input validation schema
interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  teacherId: string;
}

function validateInput(data: unknown): data is PaymentVerificationRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    'razorpay_order_id' in data &&
    typeof (data as { razorpay_order_id: unknown }).razorpay_order_id === 'string' &&
    'razorpay_payment_id' in data &&
    typeof (data as { razorpay_payment_id: unknown }).razorpay_payment_id === 'string' &&
    'razorpay_signature' in data &&
    typeof (data as { razorpay_signature: unknown }).razorpay_signature === 'string' &&
    'teacherId' in data &&
    typeof (data as { teacherId: unknown }).teacherId === 'string' &&
    (data as { razorpay_order_id: string }).razorpay_order_id.length > 0 &&
    (data as { razorpay_payment_id: string }).razorpay_payment_id.length > 0 &&
    (data as { razorpay_signature: string }).razorpay_signature.length > 0 &&
    (data as { teacherId: string }).teacherId.length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate input
    if (!validateInput(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      teacherId 
    } = body;
    
    // Get the authenticated user from the token
    const token = getAuthTokenFromCookies(request.cookies);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Development mode: Allow test payments to proceed
    if (process.env.NODE_ENV === 'development') {
      // Check if this is a test payment (order_id starts with test_)
      if (razorpay_order_id.includes('test_') || razorpay_payment_id.includes('test_')) {
        // Skip signature verification for test payments
        console.log('Development mode: Bypassing signature verification for test payment');
        
        // Find and update teacher payment status directly
        const teacher = await Teacher.findOne({ teacherId });
        if (!teacher) {
          return NextResponse.json(
            { success: false, error: 'Teacher not found' },
            { status: 404 }
          );
        }

        // Update user's onboarding status
        user.onboardingCompleted = true;
        await user.save();

        console.log('Development: Test payment verified for teacher:', teacherId);

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully (Test Mode)',
          teacherId,
          status: 'paid'
        });
      }
    }

    // Check if required environment variables exist
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }
    
    // Verify signature using crypto-safe comparison
    const expectedBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(expectedBody.toString())
      .digest("hex");
    
    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );
    
    if (!isAuthentic) {
      // Log security incident (in production, use proper logging service)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Payment signature verification failed for teacher:', teacherId);
      }
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }
    
    // Find and update teacher payment status
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Teacher not found for teacherId:', teacherId);
      }
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Prevent duplicate payment processing
    if (teacher.registrationFeeStatus === 'paid') {
      // Ensure user's onboarding status is set even if payment was already processed
      if (!user.onboardingCompleted) {
        user.onboardingCompleted = true;
        await user.save();
      }
      return NextResponse.json(
        { success: true, message: 'Payment already processed', teacherId, status: 'paid' }
      );
    }

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing payment for teacher:', teacher.teacherId);
    }

    // Update payment status atomically
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherId, registrationFeeStatus: { $ne: 'paid' } },
      {
        $set: {
          registrationFeeStatus: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paymentVerifiedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Update user's onboarding status
    user.onboardingCompleted = true;
    await user.save();

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment verified successfully for teacher:', updatedTeacher.teacherId);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      teacherId,
      status: 'paid'
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error verifying payment:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
