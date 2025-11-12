"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";

// Import components
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { RoleSelection } from "@/components/onboarding/role-selection";
import { BasicDetailsForm } from "@/components/onboarding/basic-details-form";
import { PreferencesForm } from "@/components/onboarding/preferences-form";
import { TermsStep } from "@/components/onboarding/terms-step";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { CompletionStep } from "@/components/onboarding/completion-step";
import { EmailVerificationStep } from "@/components/onboarding/email-verification-step";

// Import hooks
import { useOnboarding } from "@aotf/ui/hooks/use-onboarding";

export default function TutorialsOnboardingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initialize onboarding state for tutorials app
  const {
    // State
    currentStep,
    formData,
    isLoading,
    error,
    scriptLoaded,
    teacherId,
    isDevelopment,
    selectedTerm,
    termsAgreed,

    // Computed values
    totalSteps,
    stepNumber,
    stepLabel,
    progressPct,

    // Actions
    handleRoleSelect,
    handleNext,
    handleBack,
    updateFormData,
    setSelectedTerm,
    setTermsAgreed,
    getPaymentTypeDescription,
    initiateTestPayment,
    initiatePayment,
  } = useOnboarding("tutorials");

  // Check if user already completed onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          // User is not authenticated - redirect to login
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          router.push("/login");
          return;
        }

        // If onboarding is complete, redirect to appropriate dashboard
        if (data.user.onboardingCompleted === true && data.user?.userType) {
          if (data.user.userType === "teacher") {
            router.push("/teacher");
          } else if (data.user.userType === "guardian") {
            router.push("/feed");
          }
          return;
        } else if (data.user.onboardingCompleted !== true && data.user?.userType){
          router.push("/onboarding");
        }

        // If onboarding is not complete, stay on onboarding page
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsCheckingAuth(false);
      }
    };

    checkUserStatus();
  }, [router]);

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
          {/* Progress Indicator */}
          {currentStep !== "role" && (
            <ProgressIndicator
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              stepLabel={stepLabel}
              progressPct={progressPct}
            />
          )}

          {/* Role Selection Step */}
          {currentStep === "role" && (
            <RoleSelection
              onRoleSelect={handleRoleSelect}
              onBack={() => router.push("/")}
            />
          )}

          {/* Basic Details Step */}
          {currentStep === "details" &&
            (formData.role === "guardian" || formData.role === "teacher") && (
              <BasicDetailsForm
                formData={formData}
                onFormDataChange={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
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
          )}          {/* Terms Step (teachers only) */}
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

          {/* Payment Step (teachers only) */}
          {currentStep === "payment" && formData.role === "teacher" && (
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
          )}

          {/* Completion Step */}
          {currentStep === "complete" && (
            <CompletionStep
              userRole={formData.role as "guardian" | "teacher" | "freelancer" | "client"}
            />
          )}
        </div>
      </main>
    </div>
  );
}
