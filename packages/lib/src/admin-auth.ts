/**
 * Admin Permission Utilities
 * 
 * Utilities for checking admin permissions in API routes and components
 */

import { NextRequest, NextResponse } from 'next/server';
import { Admin, type IAdmin } from '@aotf/models';
import connectToDatabase from './mongodb';
import type { Permission } from '@aotf/config';
import { hasPermission as checkRolePermission } from '@aotf/config';
import { adminAuth } from '@aotf/nextauth';

export interface AdminAuthData {
  admin: IAdmin;
  isAuthenticated: boolean;
}

/**
 * Verify admin authentication from request
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthData | null> {
  try {
    const session = await adminAuth(request);

    if (!session || !session.user?.id) {
      return null;
    }

    await connectToDatabase();
    const admin = await Admin.findById(session.user.id);

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      admin,
      isAuthenticated: true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin auth verification error:', error);
    }
    return null;
  }
}

/**
 * Middleware to require admin authentication
 */
export async function requireAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, admin: IAdmin) => Promise<NextResponse>
): Promise<NextResponse> {
  const authData = await verifyAdminAuth(request);

  if (!authData || !authData.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  return handler(request, authData.admin);
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission,
  handler: (request: NextRequest, admin: IAdmin) => Promise<NextResponse>
): Promise<NextResponse> {
  const authData = await verifyAdminAuth(request);

  if (!authData || !authData.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  const admin = authData.admin;

  // Check if admin has permission
  if (!admin.hasPermission(permission) && !checkRolePermission(admin.role, permission)) {
    return NextResponse.json(
      { 
        success: false, 
        error: `Forbidden - You do not have permission to access this resource (${permission} required)` 
      },
      { status: 403 }
    );
  }

  return handler(request, admin);
}

/**
 * Check if admin object has permission (for use in components)
 */
export function adminHasPermission(
  admin: { role: string; permissions: Record<string, boolean> },
  permission: Permission
): boolean {
  // Super admin has all permissions
  if (admin.role === 'super_admin') {
    return true;
  }

  // Check specific permission
  return admin.permissions[permission] === true;
}

/**
 * Get admin info from localStorage (client-side only)
 */
export function getAdminInfo(): {
  name: string;
  email: string;
  role: string;
  permissions?: Record<string, boolean>;
} | null {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window === 'undefined') {
    return null;
  }

  try {
    const adminInfoStr = (globalThis as any)?.localStorage?.getItem('adminInfo');
    if (!adminInfoStr) {
      return null;
    }
    return JSON.parse(adminInfoStr);
  } catch {
    return null;
  }
}
