import { useState, useEffect, useMemo } from "react";
import { siteConfig } from "@aotf/config/site";
import { validateBasicDetailsForm, validatePreferencesForm } from "@aotf/lib/validation";
import type { OnboardingStep } from "../types/onboarding"
import type { UserRole } from "../types/onboarding"
import type { ServiceType } from "../types/onboarding"
import type { FormData as OnboardingFormData } from "../types/onboarding"

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("service");
  const [formData, setFormData] = useState<OnboardingFormData>({
    role: null,
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    subjectsOfInterest: [],
    learningMode: "",
    subjectsTeaching: [],
    experience: "",
    qualifications: "",
    teachingMode: "",
    bio: "",
    emailVerified: false,
  });

  // Load authenticated user's email and name into form data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const updates: Partial<OnboardingFormData> = {};
          if (data?.user?.email) updates.email = data.user.email;
          if (data?.user?.name) updates.name = data.user.name;
          if (data?.user?.emailVerification?.verified) updates.emailVerified = true;
          if (Object.keys(updates).length) {
            setFormData(prev => ({ ...prev, ...updates }));
          }
        }
      } catch {}
    };
    loadUser();
  }, []);

  const ensureEmailAndName = async (): Promise<{ email: string | null; name: string | null }> => {
    let email = formData.email || null;
    let name = formData.name || null;
    if (email && name) return { email, name };
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        email = email || data?.user?.email || null;
        name = name || data?.user?.name || null;
        const updates: Partial<OnboardingFormData> = {};
        if (email) updates.email = email;
        if (name) updates.name = name;
        if (Object.keys(updates).length) setFormData(prev => ({ ...prev, ...updates }));
      }
    } catch {}
    return { email, name };
  };

  // Payment state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [freelancerId, setFreelancerId] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);
  // Terms state
  const [selectedTerm, setSelectedTerm] = useState<"term-1" |  null>("term-1");
  // const [selectedTerm, setSelectedTerm] = useState<"term-1" | "term-2" | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    setIsDevelopment(window.location.hostname === "localhost");

    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setScriptLoaded(true);
          resolve(true);
        };
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // NOTE: OTP is now auto-triggered by the EmailVerificationStep component itself
  // Removed duplicate OTP trigger from here to prevent sending two emails

  // Derived step metadata: guardians have 3 steps, teachers have 6 (excluding complete)
  const { totalSteps, stepNumber, stepLabel, progressPct } = useMemo(() => {
    const isTeacher = formData.role === "teacher";
    const stepsOrder: OnboardingStep[] = isTeacher
      ? ["details", "verify", "preferences", "terms", "payment", "complete"]
      : ["details", "verify", "complete"];    const labels: Record<OnboardingStep, string> = {
      service: "Choose Service",
      role: "Choose Role",
      freelancerRole: "Choose Role",
      details: "Basic Information",
      verify: "Verify Email",
      preferences: "Preferences",
      terms: "Terms & Conditions",
      payment: "Payment",
      complete: "Complete",
    };

    const totalVisible = isTeacher ? 6 : 3; // exclude "complete" from visible count
    const index = stepsOrder.indexOf(currentStep);
    const visibleIndex =
      currentStep === "complete"
        ? totalVisible
        : Math.min(index, totalVisible - 1) + 1;

    const progress =
      currentStep === "complete"
        ? 100
        : Math.round((visibleIndex / totalVisible) * 100);

    return {
      totalSteps: totalVisible,
      stepNumber: visibleIndex,
      stepLabel: labels[currentStep],
      progressPct: progress,
    };
  }, [currentStep, formData.role]);

  const persistRole = async (role: UserRole) => {
    try {
      await fetch("/api/user/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch (e) {
      console.error("Role Persistence Error:", e);
      // Non-blocking: continue even if role persistence fails
    }
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    setFormData({ ...formData, serviceType });
    
    if (serviceType === "tutorial") {
      setCurrentStep("role"); // Go to Tutorial role selection (guardian/teacher)
    } else if (serviceType === "freelancer") {
      setCurrentStep("freelancerRole"); // Go to Freelancer role selection (freelancer/client)
    }
  };
  const handleRoleSelect = (role: UserRole) => {
    // Store the actual role in localStorage
    if (role) {
      localStorage.setItem("user", role);
    }
    setFormData({ ...formData, role });
    persistRole(role);
    setCurrentStep("details");
  };
  const completeOnboardingAndRedirectToLogin = async () => {
    try {
      await fetch("/api/onboarding/complete", { method: "POST" });
    } catch (error) {
      console.error("Onboarding completion error:", error);
    }

    const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL;
    const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "http://localhost:3002";
    
    const fallbackPath =
      formData.role === "teacher"
        ? "/teacher"
        : formData.role === "guardian"
        ? "/guardian"
        : formData.role === "freelancer"
        ? "/freelancer"
        : formData.role === "client"
        ? "/client"
        : "";

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const userType = data?.user?.userType;
        const isComplete = data?.user?.onboardingCompleted;

        if (isComplete && userType) {
          const destination =
            userType === "teacher"
              ? "/teacher"
              : userType === "guardian"
              ? "/guardian"
              : userType === "freelancer"
              ? "/freelancer"
              : userType === "client"
              ? "/client"
              : "";

          // Redirect to appropriate app
          const targetUrl = (userType === "freelancer" || userType === "client")
            ? jobsUrl
            : tutorialsUrl;

          window.location.href = `${targetUrl}${destination}`;
          return;
        }
      }
    } catch (error) {
      console.error("Failed to resolve onboarding redirect:", error);
    }

    // Fallback redirect
    const targetUrl = (formData.role === "freelancer" || formData.role === "client")
      ? jobsUrl
      : tutorialsUrl;
    
    window.location.href = `${targetUrl}${fallbackPath}`;
  };
  const handleNext = async () => {
    if (currentStep === "details") {
      setCurrentStep("verify");
      return;
    }
    if (currentStep === "verify") {
      if (formData.role === "teacher") {
        setCurrentStep("preferences");
      } else if (formData.role === "guardian") {
        await handleGuardianRegistration();
      } else if (formData.role === "freelancer") {
        setCurrentStep("terms"); // Freelancers go to terms
      } else if (formData.role === "client") {
        await handleClientRegistration(); // Clients register directly (no payment)
      }
      return;
    }
    if (currentStep === "preferences") {
      if (formData.role === "guardian") {
        // Not used anymore, but keep branch safe
        await handleGuardianRegistration();
      } else {
        setCurrentStep("terms");
      }
      return;
    }
    if (currentStep === "terms") {
      if (formData.role === "teacher") {
        await handleTeacherRegistration();
      } else if (formData.role === "freelancer") {
        await handleFreelancerRegistration();
      }
      return;
    }
    if (currentStep === "payment") {
      setCurrentStep("complete");
    }
  };
  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("terms");
    } else if (currentStep === "terms") {
      // Freelancers don't have preferences step, go directly to verify
      if (formData.role === "freelancer") {
        setCurrentStep("verify");
      } else {
        setCurrentStep("preferences");
      }
    } else if (currentStep === "preferences") {
      setCurrentStep("verify");
    } else if (currentStep === "verify") {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      // Go back to the appropriate role selection based on service type
      if (formData.role === "freelancer" || formData.role === "client") {
        setCurrentStep("freelancerRole");
      } else {
        setCurrentStep("role");
      }
    } else if (currentStep === "role" || currentStep === "freelancerRole") {
      setCurrentStep("service");
    }
  };

  const handleGuardianRegistration = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { email, name } = await ensureEmailAndName();
      if (!email || !name) {
        setError("Email and name are required");
        setIsLoading(false);
        return;
      }
           // Validate basic details
      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.location || "",
        role: formData.role,
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // Register the guardian (no learning preferences now)
      const registerResponse = await fetch("/api/guardian/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone,
          location: formData.location,
          whatsappNumber: formData.isPhoneWhatsApp ? formData.phone : formData.whatsappNumber // Always send whatsappNumber
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setCurrentStep("complete");
        await completeOnboardingAndRedirectToLogin();
      } else {
        setError(registerData.error || "Failed to register guardian");
      }
    } catch (err) {
      console.error("Guardian Registration Error:", err);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherRegistration = async () => {
    if (!selectedTerm || !termsAgreed) {
      setError("Please select a payment option and agree to terms");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { email, name } = await ensureEmailAndName();
      if (!email || !name) {
        setError("Email and name are required");
        setIsLoading(false);
        return;
      }

      // Validate basic details
      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.location || "",
        experience: formData.experience,
        qualifications: formData.qualifications,
        schoolBoard: formData.schoolBoard,
        role: formData.role
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // Validate preferences
      const preferencesValidation = validatePreferencesForm({
        subjectsTeaching: formData.subjectsTeaching,
        teachingMode: formData.teachingMode,
        bio: formData.bio,
        role: formData.role
      });

      if (!preferencesValidation.isValid) {
        setError(preferencesValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // First, register the teacher
      const registerResponse = await fetch("/api/teacher/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone,
          location: formData.location,
          experience: formData.experience,
          qualifications: formData.qualifications,
          schoolBoard: formData.schoolBoard,
          subjectsTeaching: formData.subjectsTeaching,
          teachingMode: formData.teachingMode,
          bio: formData.bio,
          whatsappNumber: formData.isPhoneWhatsApp ? formData.phone : formData.whatsappNumber // Always send whatsappNumber
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerData.success) {
        setError(registerData.error || "Failed to register teacher");
        setIsLoading(false);
        return;
      }

      // Then, accept the terms
      const termsResponse = await fetch("/api/teacher/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: registerData.teacherId,
          termsAgreed: selectedTerm,
          consultancyPaymentType:
            selectedTerm === "term-1" ? "upfront-75" : "installment-60-40",
        }),
      });

      const termsData = await termsResponse.json();

      if (termsData.success) {
        setTeacherId(registerData.teacherId);
        setCurrentStep("payment");
      } else {
        setError(termsData.error || "Failed to accept terms");
      }
    } catch (err) {
      console.error("Teacher Registration Error:", err);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreelancerRegistration = async () => {
    if (!selectedTerm || !termsAgreed) {
      setError("Please agree to terms and conditions");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { email, name } = await ensureEmailAndName();
      if (!email || !name) {
        setError("Email and name are required");
        setIsLoading(false);
        return;
      }

      // Validate basic details (freelancer specific)
      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.address || "", // freelancers use 'address' field
        role: formData.role,
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // Register the freelancer
      const registerResponse = await fetch("/api/freelancer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone,
          whatsappNumber: formData.isWhatsappSameAsPhone ? formData.phone : formData.whatsappNumber,
          address: formData.address,
          experience: formData.experience,
          experienceLevel: formData.experienceLevel,
          maxQualification: formData.maxQualification,
          schoolBoard: formData.schoolBoard,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerData.success) {
        setError(registerData.error || "Failed to register freelancer");
        setIsLoading(false);
        return;
      }

      // Accept terms
      const termsResponse = await fetch("/api/freelancer/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerId: registerData.freelancerId,
          termsAgreed: true,
        }),
      });

      const termsData = await termsResponse.json();

      if (termsData.success) {
        setFreelancerId(registerData.freelancerId);
        setCurrentStep("payment"); // Go to payment step for ₹99
      } else {
        setError(termsData.error || "Failed to accept terms");
      }
    } catch (err) {
      console.error("Freelancer Registration Error:", err);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientRegistration = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { email, name } = await ensureEmailAndName();
      if (!email || !name) {
        setError("Email and name are required");
        setIsLoading(false);
        return;
      }

      // Validate basic details
      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.address || "", // clients use 'address' field
        role: formData.role,
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // Register the client (no payment required)
      const registerResponse = await fetch("/api/client/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone,
          whatsappNumber: formData.whatsappNumber,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          address: formData.address,
          industry: formData.industry,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setCurrentStep("complete");
        // Redirect to jobs app client dashboard
        const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL;
        window.location.href = `${jobsUrl}/client`;
      } else {
        setError(registerData.error || "Failed to register client");
      }
    } catch (err) {
      console.error("Client Registration Error:", err);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData({ ...formData, ...updates });
  };

  const getPaymentTypeDescription = () => {
    if (!selectedTerm) return "";

    if (selectedTerm === "term-1") {
      return "Upfront Payment (75% of first month salary)";
    } else {
      return "Installment Payment (60% + 40% split)";
    }
  };

  const initiateTestPayment = async () => {
    if (!teacherId) {
      setError("Teacher ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate test payment data
      const testPaymentData = {
        razorpay_order_id: `test_order_${Date.now()}`,
        razorpay_payment_id: `test_payment_${Date.now()}`,
        razorpay_signature: `test_signature_${Date.now()}`,
        teacherId,
      };

      // Verify test payment
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(testPaymentData),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setCurrentStep("complete");
        await completeOnboardingAndRedirectToLogin();
      } else {
        setError("Test payment verification failed");
      }
    } catch (err) {
      console.error("Test Payment Error:", err);
      setError("Test payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!teacherId) {
      setError("Teacher ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    if (!scriptLoaded || !window.Razorpay) {
      setError("Payment gateway is loading. Please try again in a moment.");
      setIsLoading(false);
      return;
    }

    try {
      // Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: siteConfig.name,
        description: "Teacher Registration Fee",
        order_id: orderData.orderId,
        method: {
          upi: true,
          card: true,
          wallet: true,
          netbanking: false,
          emi: false,
          paylater: false,
          bank_transfer: false,
          cardless_emi: false,
          nb: false,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
              card: {
                name: "Cards",
                instruments: [{ method: "card" }],
              },
              wallet: {
                name: "Wallets",
                instruments: [{ method: "wallet" }],
              },
            },
            sequence: ["upi", "card", "wallet"],
            preferences: {
              show_default_blocks: false,
            },
            hide: [
              { method: "netbanking" },
              { method: "emi" },
              { method: "paylater" },
              { method: "bank_transfer" },
              { method: "cardless_emi" },
            ],
          },
        },
        handler: async (response: Record<string, unknown>) => {
          if (process.env.NODE_ENV === "development") {
            console.log("Payment success response:", response);
          }

          // Verify payment
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              teacherId,
            }),
          });

          if (process.env.NODE_ENV === "development") {
            console.log("Verify response status:", verifyResponse.status);
          }
          const verifyData = await verifyResponse.json();
          if (process.env.NODE_ENV === "development") {
            console.log("Verify response data:", verifyData);
          }

          if (verifyData.success) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                "Payment verified successfully, moving to complete step"
              );
            }
            setCurrentStep("complete");
            await completeOnboardingAndRedirectToLogin();
          } else {
            if (process.env.NODE_ENV === "development") {
              console.error("Payment verification failed:", verifyData);
            }
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#7C3AED",
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("Payment modal dismissed");
            }
          },
          animation: true,
        },
        readonly: {
          email: false,
          contact: false,
          name: false,
        },
        hidden: {
          email: false,
          contact: false,
          name: false,
        },
        remember_customer: false,
        send_sms_hash: false,
        allow_rotation: false,
      } as Record<string, unknown>;

      // Use type assertion for Razorpay constructor to avoid 'any' and type errors
      type RazorpayType = new (options: Record<string, unknown>) => { open: () => void };
      const RazorpayConstructor = (window as unknown as { Razorpay: RazorpayType }).Razorpay;
      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Payment initiation failed");
      } else {
        setError("Payment initiation failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Freelancer Payment Functions
  const initiateFreelancerTestPayment = async () => {
    if (!freelancerId) {
      setError("Freelancer ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate test payment data
      const testPaymentData = {
        razorpay_order_id: `test_order_${Date.now()}`,
        razorpay_payment_id: `test_payment_${Date.now()}`,
        razorpay_signature: `test_signature_${Date.now()}`,
        freelancerId,
      };

      // Verify test payment
      const verifyResponse = await fetch("/api/payment/verify-freelancer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPaymentData),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setCurrentStep("complete");
        await completeOnboardingAndRedirectToLogin();
      } else {
        setError("Test payment verification failed");
      }
    } catch (err) {
      console.error("Test Payment Error:", err);
      setError("Test payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const initiateFreelancerPayment = async () => {
    if (!freelancerId) {
      setError("Freelancer ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    if (!scriptLoaded || !window.Razorpay) {
      setError("Payment gateway is loading. Please try again in a moment.");
      setIsLoading(false);
      return;
    }

    try {
      // Create order
      const orderResponse = await fetch("/api/payment/create-order-freelancer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ freelancerId }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: siteConfig.name,
        description: "Freelancer Registration Fee (₹99)",
        order_id: orderData.orderId,
        method: {
          upi: true,
          card: true,
          wallet: true,
          netbanking: false,
          emi: false,
          paylater: false,
          bank_transfer: false,
          cardless_emi: false,
          nb: false,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
              card: {
                name: "Cards",
                instruments: [{ method: "card" }],
              },
              wallet: {
                name: "Wallets",
                instruments: [{ method: "wallet" }],
              },
            },
            sequence: ["upi", "card", "wallet"],
            preferences: {
              show_default_blocks: false,
            },
            hide: [
              { method: "netbanking" },
              { method: "emi" },
              { method: "paylater" },
              { method: "bank_transfer" },
              { method: "cardless_emi" },
            ],
          },
        },
        handler: async (response: Record<string, unknown>) => {
          if (process.env.NODE_ENV === "development") {
            console.log("Payment success response:", response);
          }

          // Verify payment
          const verifyResponse = await fetch("/api/payment/verify-freelancer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              freelancerId,
            }),
          });

          if (process.env.NODE_ENV === "development") {
            console.log("Verify response status:", verifyResponse.status);
          }
          const verifyData = await verifyResponse.json();
          if (process.env.NODE_ENV === "development") {
            console.log("Verify response data:", verifyData);
          }

          if (verifyData.success) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                "Payment verified successfully, moving to complete step"
              );
            }
            setCurrentStep("complete");
            await completeOnboardingAndRedirectToLogin();
          } else {
            if (process.env.NODE_ENV === "development") {
              console.error("Payment verification failed:", verifyData);
            }
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#7C3AED",
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("Payment modal dismissed");
            }
          },
          animation: true,
        },
        readonly: {
          email: false,
          contact: false,
          name: false,
        },
        hidden: {
          email: false,
          contact: false,
          name: false,
        },
        remember_customer: false,
        send_sms_hash: false,
        allow_rotation: false,
      } as Record<string, unknown>;

      // Use type assertion for Razorpay constructor to avoid 'any' and type errors
      type RazorpayType = new (options: Record<string, unknown>) => { open: () => void };
      const RazorpayConstructor = (window as unknown as { Razorpay: RazorpayType }).Razorpay;
      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Payment initiation failed");
      } else {
        setError("Payment initiation failed");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return {
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
    handleTeacherRegistration,
    handleFreelancerRegistration,
    handleClientRegistration,
    updateFormData,
    setSelectedTerm,
    setTermsAgreed,
    setError,
    getPaymentTypeDescription,
    initiateTestPayment,
    initiatePayment,
    initiateFreelancerTestPayment,
    initiateFreelancerPayment,
  };
}