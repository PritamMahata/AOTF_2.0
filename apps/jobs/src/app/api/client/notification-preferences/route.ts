// filepath: apps/jobs/src/app/api/client/notification-preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Client from '@aotf/models/Client';
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await Client.findOne({ email: authResult.user.email });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      preferences: client.notificationPreferences || {
        marketingEmails: true,
        applicationAlerts: true
      }
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await Client.findOne({ email: authResult.user.email });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    client.notificationPreferences = {
      ...client.notificationPreferences,
      ...body
    };

    await client.save();

    return NextResponse.json({ 
      success: true, 
      preferences: client.notificationPreferences,
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
