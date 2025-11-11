import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';
import { getRazorpayInstance, PAYMENT_AMOUNT } from '@aotf/lib/razorpay';

interface PaymentOrderRequest {
  teacherId: string;
}

function validateInput(data: unknown): data is PaymentOrderRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    'teacherId' in data &&
    typeof (data as { teacherId: unknown }).teacherId === 'string' &&
    (data as { teacherId: string }).teacherId.length > 0
  );
}

function validateTeacherId(teacherId: string): boolean {
  // Validate teacher ID format (AOT-XXXXXXXX)
  const teacherIdPattern = /^AOT-[A-Z0-9]{8}$/;
  return teacherIdPattern.test(teacherId);
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
    
    const { teacherId } = body;
    
    // Validate teacher ID format
    if (!validateTeacherId(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID format' },
        { status: 400 }
      );
    }
    
    // Find the teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if payment is already completed
    if (teacher.registrationFeeStatus === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment already completed' },
        { status: 400 }
      );
    }

    // Check if terms are accepted
    if (!teacher.termsAgreed || !teacher.termsAgreedAt) {
      return NextResponse.json(
        { success: false, error: 'Terms must be accepted before payment' },
        { status: 400 }
      );
    }

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay configuration missing');
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }
    
    // Create Razorpay order with error handling
    let order;
    try {
      const razorpay = getRazorpayInstance();
      order = await razorpay.orders.create({
        amount: PAYMENT_AMOUNT, // 50 INR in paise
        currency: 'INR',
        receipt: `teacher_${teacherId}_${Date.now()}`,
        notes: {
          teacherId: teacherId,
          purpose: 'Teacher Registration Fee'
        }
      });
    } catch (razorpayError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Razorpay order creation failed:', razorpayError);
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create payment order' },
        { status: 500 }
      );
    }
    
    // Update teacher with order ID using atomic operation
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherId, registrationFeeStatus: 'pending' },
      {
        $set: {
          razorpayOrderId: order.id,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order information' },
        { status: 500 }
      );
    }

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment order created for teacher:', teacherId);
    }
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: PAYMENT_AMOUNT,
      currency: 'INR',
      teacherId
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating order:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
