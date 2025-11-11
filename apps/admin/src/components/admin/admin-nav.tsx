"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@aotf/ui/components/button";
import type { Route } from "next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aotf/ui/components/dropdown-menu";
import {
  Users,
  GraduationCap,
  FileText,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Receipt,
  ClipboardList,
  AppWindow,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@aotf/lib/utils";
import { getAdminInfo, adminHasPermission } from "@aotf/lib/admin-auth";
import type { Permission } from "@aotf/config/src/admin-permissions";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{
    name: string;
    email: string;
    role: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    // Get admin info from localStorage
    const info = getAdminInfo();
    setAdminInfo(info);
  }, []);

  // Navigation items with permissions mapping
  const allNavigationItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard" as Permission,
      badge: null,
    },
    {
      name: "Posts",
      href: "/admin/posts",
      icon: FileText,
      permission: "posts" as Permission,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: DollarSign,
      permission: "payments" as Permission,
      badge: null,
    },
    {
      name: "Applications",
      href: "/admin/applications",
      icon: ClipboardList,
      permission: "applications" as Permission,
    },
    {
      name: "Guardians",
      href: "/admin/guardians",
      icon: Users,
      permission: "guardians" as Permission,
    },
    {
      name: "Teachers",
      href: "/admin/teachers",
      icon: GraduationCap,
      permission: "teachers" as Permission,
    },
    {
      name: "Ads",
      href: "/admin/ads",
      icon: AppWindow,
      permission: "ads" as Permission,
    },
    {
      name: "Invoices",
      href: "/admin/invoices",
      icon: Receipt,
      permission: "invoices" as Permission,
      badge: null,
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      permission: "notifications" as Permission,
      badge: null,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "settings" as Permission,
      badge: null,
    },
  ];

  // Filter navigation items based on permissions
  const navigationItems = adminInfo && adminInfo.permissions
    ? allNavigationItems.filter(item => adminHasPermission({
        role: adminInfo.role,
        permissions: adminInfo.permissions || {}
      }, item.permission))
    : allNavigationItems;

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/auth/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage and redirect
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminInfo");
      router.push("/admin/login");
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-background lg:border-r">
        <div className="flex flex-col grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center shrink-0 px-4 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                AOT Tuition Services
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer ${
                  pathname === item.href ? "bg-primary/10" : ""
                }`}
                onClick={() => router.push(item.href as Route)}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </nav>

          {/* Admin Profile */}
          <div className="shrink-0 px-4 py-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/admin/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 border-b bg-background">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <div className="flex items-center ml-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">Admin Panel</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Shield className="h-3 w-3 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/20"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-0 left-0 bottom-0 w-64 bg-background border-r">
              <div className="flex flex-col h-full pt-5 pb-4">
                <div className="flex items-center shrink-0 px-4 mb-8">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-foreground">
                      Admin Panel
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      AOT Tuition Services
                    </p>
                  </div>
                </div>
                <nav className="flex-1 px-2 space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href as Route}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href as Route}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors relative",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
