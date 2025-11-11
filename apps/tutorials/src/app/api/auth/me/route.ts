import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import Teacher from '@aotf/models/Teacher';
import Guardian from '@aotf/models/Guardian';
import { getNextAuthToken } from '@aotf/nextauth/src/token';
import { isValidObjectId } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not configured. Cannot verify user session.');
      return NextResponse.json(
        { success: false, error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

  const token = await getNextAuthToken({ request, secret });
    const tokenUserId =
      typeof token?.userId === 'string'
        ? token.userId
        : typeof token?.sub === 'string'
          ? token.sub
          : null;

    if (!tokenUserId || !isValidObjectId(tokenUserId)) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(tokenUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const teacher = await Teacher.findOne({ email: user.email }).lean<Record<string, unknown>>();
    const guardian = await Guardian.findOne({ email: user.email }).lean<Record<string, unknown>>();

    const sessionUserType =
      typeof token?.userType === 'string' && token.userType.length > 0
        ? token.userType
        : null;

    let userType: string | null = sessionUserType ?? user.role ?? null;
    let roleSpecificData: Record<string, unknown> | null = null;

    if (teacher) {
      userType = 'teacher';
      roleSpecificData = {
        teacherId: teacher.teacherId,
        name: (teacher.name as string | undefined) || user.name,
        registrationFeeStatus: teacher.registrationFeeStatus,
        location: teacher.location,
        experience: teacher.experience,
        qualifications: teacher.qualifications,
        subjectsTeaching: teacher.subjectsTeaching,
        teachingMode: teacher.teachingMode,
        bio: teacher.bio,
      };
    } else if (guardian) {
      userType = 'guardian';
      roleSpecificData = {
        guardianId: guardian.guardianId,
        name: (guardian.name as string | undefined) || user.name,
        location: guardian.location,
        grade: guardian.grade,
        subjectsOfInterest: guardian.subjectsOfInterest,
        learningMode: guardian.learningMode,
      };
    }
 
    return NextResponse.json({
      success: true,
      user: {
        id: typeof user._id === 'object' && user._id !== null && 'toString' in user._id ? user._id.toString() : String(user._id),
        email: user.email,
        name: user.name,
        userType,
        onboardingCompleted: Boolean(user.onboardingCompleted ?? token?.onboardingCompleted),
        createdAt: user.createdAt,
        ...roleSpecificData,
      },
    });
  } catch (error) {
    console.error('Error verifying user (tutorials app /api/auth/me):', error);

    return NextResponse.json(
      { success: false, error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}

export async function POST() {
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
