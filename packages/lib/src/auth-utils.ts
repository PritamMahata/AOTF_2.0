import { NextRequest } from 'next/server';
import { isValidObjectId } from 'mongoose';
import connectToDatabase from './mongodb';
import { User, Teacher, Guardian, Freelancer, Client } from '@aotf/models';
import { verifyAuthToken } from './auth-token';
import { getNextAuthToken } from '@aotf/nextauth';

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    userType: string | null;
    onboardingCompleted: boolean;
    createdAt: Date;
  };
  teacher?: Record<string, unknown>;
  guardian?: Record<string, unknown>;
  freelancer?: Record<string, unknown>;
  client?: Record<string, unknown>;
  error?: string;
}

// Verify and decode auth token (JWT + legacy fallback)
export function verifyToken(token: string): { id: string; email?: string; role?: string } | null {
  const verified = verifyAuthToken(token);
  if (!verified) {
    return null;
  }

  return {
    id: verified.userId,
    email: verified.email,
    role: verified.userType ?? verified.role ?? undefined,
  };
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not configured. Cannot verify user session.');
      return { success: false, error: 'Authentication configuration error' };
    }

  const token = await getNextAuthToken({ request, secret });
    const tokenUserId =
      typeof token?.userId === 'string'
        ? token.userId
        : typeof token?.sub === 'string'
          ? token.sub
          : null;

    if (!tokenUserId || !isValidObjectId(tokenUserId)) {
      return { success: false, error: 'Not authenticated' };
    }

    await connectToDatabase();

    const user = await User.findById(tokenUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }    const teacher = await Teacher.findOne({ email: user.email }).lean<Record<string, unknown>>();
    const guardian = await Guardian.findOne({ email: user.email }).lean<Record<string, unknown>>();
    const freelancer = await Freelancer.findOne({ email: user.email }).lean<Record<string, unknown>>();
    const client = await Client.findOne({ email: user.email }).lean<Record<string, unknown>>();

    const sessionUserType =
      typeof token?.userType === 'string' && token.userType.length > 0
        ? token.userType
        : null;

    let userType: string | null = sessionUserType ?? user.role ?? null;

    if (teacher) {
      userType = 'teacher';
    } else if (guardian) {
      userType = 'guardian';
    } else if (freelancer) {
      userType = 'freelancer';
    } else if (client) {
      userType = 'client';
    }

    return {
      success: true,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || '',
        userType,
        onboardingCompleted: Boolean(user.onboardingCompleted ?? token?.onboardingCompleted),
        createdAt: user.createdAt,
      },
      teacher: teacher ?? undefined,
      guardian: guardian ?? undefined,
      freelancer: freelancer ?? undefined,
      client: client ?? undefined,
    };
  } catch (error) {
    console.error('Error getting authenticated user via NextAuth:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function requireTeacherAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await getAuthenticatedUser(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  if (!authResult.teacher) {
    return { success: false, error: 'Teacher access required' };
  }
  
  return authResult;
}

export async function requireGuardianAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await getAuthenticatedUser(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  if (!authResult.guardian) {
    return { success: false, error: 'Guardian access required' };
  }
  
  return authResult;
}

export async function requireFreelancerAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await getAuthenticatedUser(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  if (!authResult.freelancer) {
    return { success: false, error: 'Freelancer access required' };
  }
  
  return authResult;
}

export async function requireClientAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await getAuthenticatedUser(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  if (!authResult.client) {
    return { success: false, error: 'Client access required' };
  }
  
  return authResult;
}