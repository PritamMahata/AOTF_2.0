"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";

// Import components
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { ServiceSelection } from "@/components/onboarding/service-selection";
import { RoleSelection } from "@/components/onboarding/role-selection";
import { FreelancerRoleSelection } from "@/components/onboarding/freelancer-role-selection";
import { BasicDetailsForm } from "@/components/onboarding/basic-details-form";
import { FreelancerDetailsForm } from "@/components/onboarding/freelancer-details-form";
import { ClientDetailsForm } from "@/components/onboarding/client-details-form";
import { PreferencesForm } from "@/components/onboarding/preferences-form";
import { TermsStep } from "@/components/onboarding/terms-step";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { CompletionStep } from "@/components/onboarding/completion-step";

// Import hooks
import { useOnboarding } from "@aotf/ui/hooks/use-onboarding";
import { EmailVerificationStep } from "@/components/onboarding/email-verification-step";

export default function OnboardingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL;
  const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL;

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
        {" "}
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          {currentStep !== "service" &&
            currentStep !== "role" &&
            currentStep !== "freelancerRole" && (
              <ProgressIndicator
                stepNumber={stepNumber}
                totalSteps={totalSteps}
                stepLabel={stepLabel}
                progressPct={progressPct}
              />
            )}
          {/* Service Selection Step */}
          {currentStep === "service" && (
            <ServiceSelection
              onServiceSelect={handleServiceSelect}
              onCancel={() => {
                router.push("/");
              }}
            />
          )}          {/* Role Selection Step for Tutorial */}
          {currentStep === "role" && (
            <RoleSelection
              onRoleSelect={handleRoleSelect}
              onBack={handleBack}
            />
          )}
          {/* Freelancer Role Selection Step */}
          {currentStep === "freelancerRole" && (
            <FreelancerRoleSelection
              onRoleSelect={handleRoleSelect}
              onBack={handleBack}
            />
          )}
          {/* Basic Details Step for Guardian/Teacher */}
          {currentStep === "details" &&
            (formData.role === "guardian" || formData.role === "teacher") && (
              <BasicDetailsForm
                formData={formData}
                onFormDataChange={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          {/* Freelancer Details Form */}
          {currentStep === "details" && formData.role === "freelancer" && (
            <FreelancerDetailsForm
              formData={{
                phone: formData.phone || "",
                whatsappNumber: formData.whatsappNumber || "",
                isWhatsappSameAsPhone: formData.isWhatsappSameAsPhone || false,
                address: formData.address || "",
                experience: formData.experience || "",
                experienceLevel: formData.experienceLevel || "",
                maxQualification: formData.maxQualification || "",
                schoolBoard: formData.schoolBoard || "",
              }}
              onChange={(data) => updateFormData(data)}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
          {/* Client Details Form */}
          {currentStep === "details" && formData.role === "client" && (
            <ClientDetailsForm
              formData={{
                phone: formData.phone || "",
                whatsappNumber: formData.whatsappNumber || "",
                companyName: formData.companyName || "",
                companyWebsite: formData.companyWebsite || "",
                address: formData.address || "",
                industry: formData.industry || "",
              }}
              onChange={(data) => updateFormData(data)}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
          {/* Email Verification Step */}
          {currentStep === "verify" && (
            <EmailVerificationStep
              email={formData.email}
              onVerified={async () => {
                updateFormData({ emailVerified: true });
                await handleNext();
              }}
              onBack={handleBack}
            />
          )}
          {/* Preferences Step (teachers only) */}
          {currentStep === "preferences" && formData.role === "teacher" && (
            <PreferencesForm
              formData={formData}
              onFormDataChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
              error={error}
            />
          )}{" "}
          {/* Terms Step (teachers and freelancers) */}
          {currentStep === "terms" && formData.role === "teacher" && (
            <TermsStep
              selectedTerm={selectedTerm}
              termsAgreed={termsAgreed}
              isLoading={isLoading}
              error={error}
              userName={formData.name}
              onTermSelect={setSelectedTerm}
              onTermsAgreed={setTermsAgreed}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === "terms" && formData.role === "freelancer" && (
            <TermsStep
              selectedTerm={selectedTerm}
              termsAgreed={termsAgreed}
              isLoading={isLoading}
              error={error}
              userName={formData.name}
              onTermSelect={setSelectedTerm}
              onTermsAgreed={setTermsAgreed}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {/* Payment Step (teachers only) */}
          {currentStep === "payment" && formData.role === "teacher" && (
            <div>
              <PaymentStep
                teacherId={teacherId}
                selectedTerm={selectedTerm}
                isLoading={isLoading}
                scriptLoaded={scriptLoaded}
                isDevelopment={isDevelopment}
                error={error}
                getPaymentTypeDescription={getPaymentTypeDescription}
                onInitiatePayment={initiatePayment}
                onInitiateTestPayment={initiateTestPayment}
                onBack={handleBack}
              />
            </div>
          )}
          {/* Payment Step (freelancers only) */}
          {currentStep === "payment" && formData.role === "freelancer" && (
            <div>
              <PaymentStep
                teacherId={freelancerId}
                selectedTerm={selectedTerm}
                isLoading={isLoading}
                scriptLoaded={scriptLoaded}
                isDevelopment={isDevelopment}
                error={error}
                getPaymentTypeDescription={() =>
                  "Freelancer Registration Fee (₹99)"
                }
                onInitiatePayment={initiateFreelancerPayment}
                onInitiateTestPayment={initiateFreelancerTestPayment}
                onBack={handleBack}
              />
            </div>
          )}
          {/* Completion Step */}
          {currentStep === "complete" && (
            <CompletionStep
              userRole={
                formData.role as
                  | "guardian"
                  | "teacher"
                  | "freelancer"
                  | "client"
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
