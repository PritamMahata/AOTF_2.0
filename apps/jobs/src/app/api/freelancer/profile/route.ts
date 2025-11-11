import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import Freelancer from '@aotf/models/Freelancer';

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
        error: 'Freelancer profile not found. Please complete registration.' 
      }, { status: 404 });
    }    return NextResponse.json({ 
      success: true, 
      freelancer: {
        freelancerId: freelancer.freelancerId,
        name: freelancer.name,
        email: freelancer.email,
        phone: freelancer.phone,
        whatsappNumber: freelancer.whatsappNumber,
        address: freelancer.address,
        avatar: freelancer.avatar,
        bio: freelancer.bio,
        skills: freelancer.skills,
        experienceLevel: freelancer.experienceLevel,
        hourlyRate: freelancer.hourlyRate,
        availability: freelancer.availability,
        experience: freelancer.experience,
        maxQualification: freelancer.maxQualification,
        rating: freelancer.rating,
        totalClients: freelancer.totalClients,
        registrationFeeStatus: freelancer.registrationFeeStatus,
        createdAt: freelancer.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch freelancer profile' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    }    const body = await request.json();
    const updateFields = [
      'name', 'phone', 'whatsappNumber', 'address', 'bio', 'skills', 
      'experienceLevel', 'hourlyRate', 'availability', 'experience', 
      'maxQualification'
    ];

    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        (freelancer as any)[field] = body[field];
      }
    });

    await freelancer.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      freelancer 
    });
  } catch (error) {
    console.error('Error updating freelancer profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}
