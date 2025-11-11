import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import { validateSignupForm } from '@aotf/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();

    // Validate input using the validation utility
    const validation = validateSignupForm(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.errors.join(', ')
        },
        { status: 400 }
      );
    }
    
    const { email, password, name } = body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      name: (name || '').trim()
    });
    
    try {
      await user.save();
    } catch (saveError) {
      // Handle specific MongoDB errors
      if ((saveError as { code?: number }).code === 11000) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      if ((saveError as { name?: string; errors?: Record<string, { message: string }> }).name === 'ValidationError') {
        const errorMessages = Object.values((saveError as { errors: Record<string, { message: string }> }).errors).map((err) => err.message);
        return NextResponse.json(
          { success: false, error: errorMessages.join(', ') },
          { status: 400 }
        );
      }
      
      throw saveError;
    }
    
    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('User registered successfully:', email);
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully. Please sign in to continue.',
      user: {
        id: typeof user._id === 'object' && user._id !== null && 'toString' in user._id ? user._id.toString() : String(user._id),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    }, { status: 201 });
    
    return response;
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating user:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create user account' },
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
