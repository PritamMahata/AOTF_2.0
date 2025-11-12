"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";

// Import components
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { FreelancerRoleSelection } from "@/components/onboarding/freelancer-role-selection";
import { FreelancerDetailsForm, FreelancerFormData } from "@/components/onboarding/freelancer-details-form";
import { ClientDetailsForm, ClientFormData } from "@/components/onboarding/client-details-form";
import { TermsStep } from "@/components/onboarding/terms-step";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { CompletionStep } from "@/components/onboarding/completion-step";
import { EmailVerificationStep } from "@/components/onboarding/email-verification-step";

// Import hooks
import { useOnboarding } from "@aotf/ui/hooks/use-onboarding";

export default function JobsOnboardingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initialize onboarding state for jobs app
  const {
    // State
    currentStep,
    formData,
    isLoading,
    error,
    scriptLoaded,
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
    handleRoleSelect,
    handleNext,
    handleBack,
    updateFormData,
    setSelectedTerm,
    setTermsAgreed,
    getPaymentTypeDescription,
    initiateTestPayment,
    initiatePayment,
  } = useOnboarding("jobs");

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
          if (data.user.userType === "client") {
            router.push("/client");
          } else if (data.user.userType === "freelancer") {
            router.push("/freelancer");
          }
          return;
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

          {/* Freelancer Role Selection Step */}
          {currentStep === "role" && (
            <FreelancerRoleSelection
              onRoleSelect={handleRoleSelect}
              onBack={() => router.push("/")}
            />
          )}          {/* Freelancer Details Form */}
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
              onChange={(data: Partial<FreelancerFormData>) => updateFormData(data)}
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
              onChange={(data: Partial<ClientFormData>) => updateFormData(data)}
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
          )}          {/* Terms Step (freelancers only) */}
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

          {/* Payment Step (freelancers only) */}
          {currentStep === "payment" && formData.role === "freelancer" && (
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
