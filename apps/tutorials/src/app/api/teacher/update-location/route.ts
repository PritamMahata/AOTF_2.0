import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';

interface UpdateLocationRequest {
  teacherId: string;
  location: string;
}

function validateInput(data: unknown): data is UpdateLocationRequest {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.teacherId === 'string' &&
    typeof obj.location === 'string' &&
    obj.teacherId.length > 0 &&
    obj.location.length > 0
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
    
    const { teacherId, location } = body;
    
    // Validate teacher ID format
    if (!validateTeacherId(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID format' },
        { status: 400 }
      );
    }
    
    // Find and update the teacher
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherId },
      {
        $set: {
          location: location.trim(),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Teacher location updated successfully:', teacherId, '→', location);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Teacher location updated successfully',
      teacherId,
      location: updatedTeacher.location
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating teacher location:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update teacher location' },
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
