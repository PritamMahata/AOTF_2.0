import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Guardian from '@aotf/models/Guardian';
import User from '@aotf/models/User';
import { customAlphabet } from 'nanoid';
import { validateBasicDetailsForm } from '@aotf/lib/validation';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

// Create a custom nanoid with only alphanumeric characters (A-Z, 0-9)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5);

async function generateUniqueGuardianId(maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const uniqueId = `AOG-${nanoid()}`;
    
    // Check for uniqueness
    const existingGuardian = await Guardian.findOne({ guardianId: uniqueId });
    if (!existingGuardian) {
      return uniqueId;
    }
    
    // If this is the last attempt and still conflicts, log it
    if (attempt === maxRetries - 1 && process.env.NODE_ENV === 'development') {
      console.warn('Maximum retries reached for guardian ID generation');
    }
  }
  
  throw new Error('Failed to generate unique guardian ID');
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate basic details
    const basicDetailsValidation = validateBasicDetailsForm({
      phone: body.phone || "",
      location: body.location || "",
      role: 'guardian'
    });

    if (!basicDetailsValidation.isValid) {
      return NextResponse.json(
        { success: false, error: basicDetailsValidation.errors.join(', ') },
        { status: 400 }
      );
    }
    
    const { name, email, phone, location, whatsappNumber } = body;
    
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
    
    // Check if guardian with this email already exists
    const existingGuardian = await Guardian.findOne({ email: email.toLowerCase() });
    if (existingGuardian) {
      return NextResponse.json(
        { success: false, error: 'Guardian with this email already exists' },
        { status: 409 }
      );
    }
    
    let uniqueId: string;
    try {
      uniqueId = await generateUniqueGuardianId();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unable to generate unique guardian ID' },
        { status: 500 }
      );
    }
    
    // Create new guardian entry
    const guardianData = {
      guardianId: uniqueId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: location.trim(),
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : ''
    };
    
    const guardian = new Guardian(guardianData);
    
    // Save with error handling
    try {
      await guardian.save();
    } catch (saveError) {
      // Handle specific MongoDB errors
      if (saveError instanceof Error && saveError.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Guardian with this email already exists' },
          { status: 409 }
        );
      }
      throw saveError;
    }
    
    // Update the user's role and onboarding status
    user.role = 'guardian';
    user.onboardingCompleted = true;
    await user.save();
    
    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Guardian registered successfully:', uniqueId);
    }
    
    return NextResponse.json({
      success: true,
      guardianId: uniqueId,
      message: 'Guardian registered successfully',
      guardian: {
        guardianId: uniqueId,
        name: guardian.name,
        email: guardian.email,
        location: guardian.location,
        whatsappNumber: guardian.whatsappNumber // Include WhatsApp number in response for confirmation
      }
    });
    
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating guardian:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to register guardian' },
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
