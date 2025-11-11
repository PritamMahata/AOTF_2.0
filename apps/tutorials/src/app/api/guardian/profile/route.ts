import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Guardian from '@aotf/models/Guardian';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate guardian
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find guardian by email
    const guardian = await Guardian.findOne({ email: authResult.user.email });
    
    if (!guardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const guardianProfile = {
      role: 'guardian',
      guardianId: guardian.guardianId,
      name: guardian.name,
      email: guardian.email,
      phone: guardian.phone,
      whatsappNumber: guardian.whatsappNumber || '',
      location: guardian.location,
      avatar: guardian.avatar || '',
      grade: guardian.grade || '',
      subjectsOfInterest: guardian.subjectsOfInterest || [],
      learningMode: guardian.learningMode || '',
      createdAt: guardian.createdAt,
      updatedAt: guardian.updatedAt,
      userId: authResult.user.id
    };

    return NextResponse.json({ 
      success: true, 
      guardian: guardianProfile 
    });

  } catch (error) {
    console.error('Error fetching guardian profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate guardian
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find guardian by email
    const guardian = await Guardian.findOne({ email: authResult.user.email });
    
    if (!guardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const updateData = await request.json();

    // Define allowed fields for update
    const allowedFields = [
      'name', 'phone', 'whatsappNumber', 'location', 
      'grade', 'subjectsOfInterest', 'learningMode', 'avatar'
    ];

    const filteredData: Record<string, unknown> = {};
    
    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredData[field] = updateData[field];
      }
    });

    // Update guardian
    const updatedGuardian = await Guardian.findOneAndUpdate(
      { email: authResult.user.email },
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedGuardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    // Return updated profile
    const guardianProfile = {
      role: 'guardian',
      guardianId: updatedGuardian.guardianId,
      name: updatedGuardian.name,
      email: updatedGuardian.email,
      phone: updatedGuardian.phone,
      whatsappNumber: updatedGuardian.whatsappNumber || '',
      location: updatedGuardian.location,
      avatar: updatedGuardian.avatar || '',
      grade: updatedGuardian.grade || '',
      subjectsOfInterest: updatedGuardian.subjectsOfInterest || [],
      learningMode: updatedGuardian.learningMode || '',
      createdAt: updatedGuardian.createdAt,
      updatedAt: updatedGuardian.updatedAt,
      userId: authResult.user.id
    };

    return NextResponse.json({ 
      success: true, 
      guardian: guardianProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating guardian profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
