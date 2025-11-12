"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";

// Import only service selection component
import { ServiceSelection } from "@/components/onboarding/service-selection";

// Import hooks
import { useOnboarding } from "@/hooks/use-onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || "http://localhost:3002";
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "http://localhost:3003";

  // Initialize onboarding state early so formData is available to effects below
  const {
    // State
    currentStep,
    formData,
    isLoading,
    error,
    scriptLoaded,
    teacherId,
    freelancerId,
    isDevelopment,
    selectedTerm,
    termsAgreed,

    // Computed values
    totalSteps,
    stepNumber,
    stepLabel,
    progressPct,

    // Actions
    handleServiceSelect,
    handleRoleSelect,
    handleNext,
    handleBack,
    updateFormData,
    setSelectedTerm,
    setTermsAgreed,
    getPaymentTypeDescription,
    initiateTestPayment,
    initiatePayment,
    initiateFreelancerPayment,
    initiateFreelancerTestPayment,
  } = useOnboarding();

  // Read optional message from query string (e.g., redirected from login)
  useEffect(() => {
    const url = new URL(window.location.href);
    const msg = url.searchParams.get("msg");
    if (msg) {
      if (msg === "Please complete onboarding first") {
        import("sonner").then(({ toast }) => toast.error(msg));
      }
    }
  }, []); // Check if user already has a role and redirect to dashboard
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          // User is not authenticated at all
          setIsCheckingAuth(false);
          setUserDataLoaded(false);
          return;
        }

        const data = await response.json();

        // If user is not authenticated at all, they need to login first
        if (!data.success || !data.user) {
          setIsCheckingAuth(false);
          setUserDataLoaded(false);
          return;
        }

        // Mark that we have user data
        setUserDataLoaded(true);        // If onboarding is complete, redirect to appropriate dashboard
        if (data.user.onboardingCompleted === true && data.user?.userType) {
          if (data.user.userType === "teacher") {
            window.location.href = `${tutorialsUrl}/teacher`;
          } else if (data.user.userType === "guardian") {
            window.location.href = `${tutorialsUrl}/guardian`;
          } else if (data.user.userType === "client") {
            window.location.href = `${jobsUrl}/client/dashboard`;
          } else if (data.user.userType === "freelancer") {
            window.location.href = `${jobsUrl}/freelancer/dashboard`;
          }
          return;
        }

        // If onboarding is not complete, stay on onboarding page
        setIsCheckingAuth(false);
      } catch (error) {
        console.log("Error checking user status:", error);
        setIsCheckingAuth(false);
        setUserDataLoaded(false);
      }
    };    checkUserStatus();
  }, [tutorialsUrl, jobsUrl]); // If name/email are missing after auth check completes, redirect to login
  useEffect(() => {
    // Don't check until initial auth check is complete
    if (isCheckingAuth) return;

    // Only check if we confirmed user is NOT loaded
    // If userDataLoaded is true, it means user is authenticated and data should be available
    if (!userDataLoaded) {
      // User is not authenticated, redirect to login
      import("sonner").then(({ toast }) =>
        toast.error("Please login to continue onboarding")
      );
      setTimeout(() => {
        router.replace(
          `/?tab=signup&msg=${encodeURIComponent(
            "Please login to continue onboarding"
          )}`
        );
      }, 1500);
    }
  }, [isCheckingAuth, userDataLoaded, router]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NormalAppHeader />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Service Selection Step - Main app only handles service selection */}
          {/* After selection, user is redirected to tutorials/ or jobs/ app to complete onboarding */}
          {currentStep === "service" && (
            <ServiceSelection
              onServiceSelect={handleServiceSelect}
              onCancel={() => {
                router.push("/");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
