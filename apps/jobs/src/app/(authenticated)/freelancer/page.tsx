"use client";

import { useState, useEffect } from "react";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent } from "@aotf/ui/components/card";
import { Loader2 } from "lucide-react";
import ApplicationsManagement from "@/app/(user)/(authenticated)/freelancer/applications/page";

// Dashboard data types
interface DashboardStats {
  totalApplications: number;
  thisMonthEarnings: string;
  upcomingSessions: number;
  activePostsCount: number;
}

interface ClientApplication {
  id: number;
  client: {
    name: string;
    avatar: string;
    grade: string;
    location: string;
  };
  postTitle: string;
  subject: string;
  message: string;
  appliedDate: string;
  status: string;
  urgency: string;
}

interface UpcomingSession {
  id: number;
  client: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  status: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentApplications: ClientApplication[];
  upcomingSessions: UpcomingSession[];
  freelancer: {
    name: string;
    rating: number;
    totalClients: number;
    hourlyRate: string;
    subjects: string[];
  };
}

export default function FreelancerDashboard() {
  // Dynamic data state
  const [, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mainAppOnboardingUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in'}/onboarding`;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/freelancer/applications", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to main app if not authenticated
            const mainUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in';
            window.location.href = mainUrl;
            return;
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setDashboardData(data.data);
        } else {
          throw new Error(data.error || "Failed to load dashboard");
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mainAppOnboardingUrl]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-3xl lg:col-span-3 mx-auto">
          <ApplicationsManagement />
        </div>
      </div>
    </div>
  );
}