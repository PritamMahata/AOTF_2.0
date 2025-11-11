import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Admin from '@aotf/models/Admin';
import { adminAuth } from '@/lib/nextauth/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await adminAuth(request);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin session missing' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findById(session.user.id);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Admin account is deactivated' },
        { status: 403 }
      );
    }

    const plainPermissions = admin.permissions
      ? JSON.parse(JSON.stringify(admin.permissions))
      : undefined;

    return NextResponse.json({
      success: true,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: plainPermissions ?? {},
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin verification error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
