"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle } from "lucide-react";
import { getAdminInfo, adminHasPermission } from "@aotf/lib/admin-auth";
import type { Permission } from "@aotf/config/src/admin-permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkPermission = () => {
      const adminInfo = getAdminInfo();

      if (!adminInfo) {
        // Not logged in, redirect to login
        router.push("/admin/login");
        return;
      }

      // Ensure permissions exist
      if (!adminInfo.permissions) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const hasPermission = adminHasPermission(
        { role: adminInfo.role, permissions: adminInfo.permissions },
        permission
      );
      setHasAccess(hasPermission);
      setIsLoading(false);

      if (!hasPermission) {
        // Optional: You can redirect to dashboard or show error
        // router.push("/admin/dashboard");
      }
    };

    checkPermission();
  }, [permission, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Required Permission:</strong> {permission}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This page requires special permissions that your account doesn&apos;t have. 
                Please contact your administrator if you believe this is an error.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push("/admin/dashboard")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
