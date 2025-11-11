"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@aotf/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aotf/ui/components/dropdown-menu";
import { LogOut, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import UserAvatar from "../components/UserAvatar";
import { siteConfig } from "../../../config/src/site";
import Image from "next/image";

interface AppHeaderProps {
  userRole?: "guardian" | "teacher";
  userName?: string;
  userAvatar?: string;
  onNavigate?: (path: string) => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  userType: "guardian" | "teacher";
  onboardingCompleted: boolean;
}

export function AppHeader({
  userRole: initialUserRole,
  userName: initialUserName,
  userAvatar,
  onNavigate,
}: AppHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        
        if (data.success && data.user) {
          setIsAuthenticated(true);
          setUserData(data.user);
        } else {
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const userRole = userData?.userType || initialUserRole || "guardian";
  const userName = userData?.name || initialUserName || (userRole === "guardian" ? "Guardian" : "Teacher");

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path as any);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("user");
        document.cookie = "auth-token=; Max-Age=0; path=/;";
        window.location.href = "/";
      } else {
        console.error("Logout failed:", data.error);
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <Image
              width={70}
              height={70}
              src="/AOTF.svg"
              alt="AOT Tuition"
              className="h-7"
            />
            <h1 className="hidden sm:block text-2xl font-bold text-foreground ">
              {siteConfig.name}
            </h1>
          </div>
        </div>

        {/* Right - Show loading, auth buttons, or user info */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : isAuthenticated && userData ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-auto p-2"
                >
                  <UserAvatar name={userName} src={userAvatar} size={32} />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {userName}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {userRole}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigation("/")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function NormalAppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center sm:justify-between">
        <Link href={"/" as any}>
          <div className="flex items-end gap-2">
            <Image
              width={70}
              height={70}
              src="/AOTF.svg"
              alt="AOT Tuition"
              className="h-10"
            />
            <h1 className="hidden sm:block text-2xl font-bold text-foreground">
              {siteConfig.name}
            </h1>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={"/" as any}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href={"/feed" as any}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Opportunities
          </Link>
          <Link
            href={"/about" as any}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About Us
          </Link>
          <Link
            href={"/contact" as any}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
