/**
 * Admin Role Permissions Configuration
 * 
 * This file defines the permissions for each admin role.
 * Update this file to easily modify role permissions in the future.
 */

export type AdminRole = 'super_admin' | 'support_admin';

export type Permission = 
  | 'dashboard'
  | 'posts'
  | 'payments'
  | 'applications'
  | 'guardians'
  | 'teachers'
  | 'ads'
  | 'invoices'
  | 'notifications'
  | 'settings';

export interface RolePermissions {
  dashboard: boolean;
  posts: boolean;
  payments: boolean;
  applications: boolean;
  guardians: boolean;
  teachers: boolean;
  ads: boolean;
  invoices: boolean;
  notifications: boolean;
  settings: boolean;
}

/**
 * Default permissions for each role
 * 
 * Super Admin: Full access to all features
 * Support Admin: Limited access to customer-facing features
 */
export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  super_admin: {
    dashboard: true,
    posts: true,
    payments: true,
    applications: true,
    guardians: true,
    teachers: true,
    ads: true,
    invoices: true,
    notifications: true,
    settings: true,
  },
  support_admin: {
    dashboard: false, // Can view dashboard
    posts: true,
    payments: false,
    applications: true,
    guardians: true,
    teachers: true,
    ads: false, // Cannot manage ads
    invoices: true,
    notifications: true,
    settings: false, // Cannot access settings
  },
};

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: AdminRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  // Super admin always has all permissions
  if (role === 'super_admin') {
    return true;
  }
  return ROLE_PERMISSIONS[role][permission] === true;
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: AdminRole): string {
  const roleNames: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    support_admin: 'Support Admin',
  };
  return roleNames[role];
}

/**
 * Get description for role
 */
export function getRoleDescription(role: AdminRole): string {
  const descriptions: Record<AdminRole, string> = {
    super_admin: 'Full access to all features and settings',
    support_admin: 'Access to customer support and management features',
  };
  return descriptions[role];
}
