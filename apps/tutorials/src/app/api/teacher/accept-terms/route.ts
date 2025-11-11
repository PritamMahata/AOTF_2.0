import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';

interface AcceptTermsRequest {
  teacherId: string;
  termsAgreed: string;
  consultancyPaymentType: string;
}

function validateInput(data: unknown): data is AcceptTermsRequest {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.teacherId === 'string' &&
    typeof obj.termsAgreed === 'string' &&
    typeof obj.consultancyPaymentType === 'string' &&
    obj.teacherId.length > 0 &&
    obj.termsAgreed.length > 0 &&
    obj.consultancyPaymentType.length > 0
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
    
    const { teacherId, termsAgreed, consultancyPaymentType } = body;
    
    // Validate teacher ID format
    if (!validateTeacherId(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID format' },
        { status: 400 }
      );
    }
    
    // Validate terms
    if (!['term-1'].includes(termsAgreed)) {
      return NextResponse.json(
        { success: false, error: 'Invalid terms selection' },
        { status: 400 }
      );
    }
    // if (!['term-1', 'term-2'].includes(termsAgreed)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid terms selection' },
    //     { status: 400 }
    //   );
    // }

    // Validate payment type
    if (!['upfront-75', 'installment-60-40'].includes(consultancyPaymentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment type selection' },
        { status: 400 }
      );
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if terms already accepted
    if (teacher.termsAgreed && teacher.termsAgreedAt) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Terms already accepted',
          teacherId,
          termsAgreed: teacher.termsAgreed,
          consultancyPaymentType: teacher.consultancyPaymentType
        }
      );
    }
    
    // Update teacher with terms agreement using atomic operation
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherId },
      {
        $set: {
          termsAgreed,
          termsAgreedAt: new Date(),
          consultancyPaymentType
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, error: 'Failed to update terms agreement' },
        { status: 500 }
      );
    }

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Terms accepted for teacher:', teacherId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Terms accepted successfully',
      teacherId,
      termsAgreed,
      consultancyPaymentType
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error accepting terms:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to accept terms' },
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
