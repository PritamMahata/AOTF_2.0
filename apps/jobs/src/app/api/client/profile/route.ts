// filepath: apps/jobs/src/app/api/client/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Client from '@aotf/models/Client';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate client
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find client by email
    const client = await Client.findOne({ email: authResult.user.email });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const clientProfile = {
      role: 'client',
      clientId: client.clientId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsappNumber: client.whatsappNumber || '',
      companyName: client.companyName || '',
      companyWebsite: client.companyWebsite || '',
      address: client.address || '',
      industry: client.industry || '',
      avatar: client.avatar || '',
      bio: client.bio || '',
      totalJobsPosted: client.totalJobsPosted || 0,
      rating: client.rating || 0,
      notificationPreferences: client.notificationPreferences || {
        marketingEmails: true,
        applicationAlerts: true
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      userId: authResult.user.id
    };

    return NextResponse.json({ 
      success: true, 
      client: clientProfile
    });

  } catch (error) {
    console.error('Error fetching client profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate client
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find client by email
    const client = await Client.findOne({ email: authResult.user.email });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // List of fields that can be updated
    const allowedUpdates = [
      'name',
      'phone',
      'whatsappNumber',
      'companyName',
      'companyWebsite',
      'address',
      'industry',
      'avatar',
      'bio',
      'notificationPreferences'
    ];

    // Update only allowed fields
    Object.keys(body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === 'notificationPreferences' && typeof body[key] === 'object') {
          client.notificationPreferences = {
            ...client.notificationPreferences,
            ...body[key]
          };
        } else {
          (client as any)[key] = body[key];
        }
      }
    });

    // Save updated client
    await client.save();

    // Return updated profile
    const clientProfile = {
      role: 'client',
      clientId: client.clientId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsappNumber: client.whatsappNumber || '',
      companyName: client.companyName || '',
      companyWebsite: client.companyWebsite || '',
      address: client.address || '',
      industry: client.industry || '',
      avatar: client.avatar || '',
      bio: client.bio || '',
      totalJobsPosted: client.totalJobsPosted || 0,
      rating: client.rating || 0,
      notificationPreferences: client.notificationPreferences || {
        marketingEmails: true,
        applicationAlerts: true
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      userId: authResult.user.id
    };

    return NextResponse.json({ 
      success: true, 
      client: clientProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating client profile:', error);
    return NextResponse.json(
      { error: 'Failed to update client profile' },
      { status: 500 }
    );
  }
}
