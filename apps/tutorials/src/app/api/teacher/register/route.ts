import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';
import User from '@aotf/models/User';
import { customAlphabet } from 'nanoid';
import { validateBasicDetailsForm, validatePreferencesForm } from '@aotf/lib/validation';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

// Create a custom nanoid with only alphanumeric characters (A-Z, 0-9)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

async function generateUniqueTeacherId(maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const uniqueId = `AOT-${nanoid()}`;
    
    // Check for uniqueness
    const existingTeacher = await Teacher.findOne({ teacherId: uniqueId });
    if (!existingTeacher) {
      return uniqueId;
    }
    
    // If this is the last attempt and still conflicts, log it
    if (attempt === maxRetries - 1 && process.env.NODE_ENV === 'development') {
      console.warn('Maximum retries reached for teacher ID generation');
    }
  }
  
  throw new Error('Failed to generate unique teacher ID');
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate basic details
    const basicDetailsValidation = validateBasicDetailsForm({
      phone: body.phone || "",
      location: body.location || "",
      experience: body.experience,
      qualifications: body.qualifications,
      schoolBoard: body.schoolBoard,
      role: 'teacher'
    });

    if (!basicDetailsValidation.isValid) {
      return NextResponse.json(
        { success: false, error: basicDetailsValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validate preferences
    const preferencesValidation = validatePreferencesForm({
      subjectsTeaching: body.subjectsTeaching,
      teachingMode: body.teachingMode,
      bio: body.bio,
      role: 'teacher'
    });

    if (!preferencesValidation.isValid) {
      return NextResponse.json(
        { success: false, error: preferencesValidation.errors.join(', ') },
        { status: 400 }
      );
    }
    
    const { name, email, phone, location, experience, qualifications, schoolBoard, subjectsTeaching, teachingMode, bio, whatsappNumber } = body;
    
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
    
    // Check if teacher with this email already exists
    const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher with this email already exists' },
        { status: 409 }
      );
    }
    
    let uniqueId: string;
    try {
      uniqueId = await generateUniqueTeacherId();
    } catch (error) {
      console.error('Error generating unique teacher ID:', error);
      return NextResponse.json(
        { success: false, error: 'Unable to generate unique teacher ID' },
        { status: 500 }
      );
    }
    
    // Create new teacher entry with complete data
    const teacherData = {
      teacherId: uniqueId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: location.trim(),
      experience: experience?.trim(),
      qualifications: qualifications?.trim(),
      schoolBoard: schoolBoard?.trim(),
      subjectsTeaching: subjectsTeaching || [],
      teachingMode,
      bio: bio?.trim(),
      registrationFeeStatus: 'pending' as const,
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : ''
    };
    
    const teacher = new Teacher(teacherData);
    
    // Save with error handling
    try {
      await teacher.save();
    } catch (saveError) {
      // Handle specific MongoDB errors
      if (saveError instanceof Error && saveError.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Teacher with this email already exists' },
          { status: 409 }
        );
      }
      throw saveError;
    }
    
    // Update the user's role (onboardingCompleted will be set after payment)
    user.role = 'teacher';
    await user.save();
    
    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Teacher registered successfully:', uniqueId);
    }
    
    return NextResponse.json({
      success: true,
      teacherId: uniqueId,
      message: 'Teacher registered successfully',
      teacher: {
        teacherId: uniqueId,
        name: teacher.name,
        email: teacher.email,
        registrationFeeStatus: teacher.registrationFeeStatus,
        whatsappNumber: teacher.whatsappNumber // Include WhatsApp number in response for confirmation
      }
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating teacher:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to register teacher' },
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
