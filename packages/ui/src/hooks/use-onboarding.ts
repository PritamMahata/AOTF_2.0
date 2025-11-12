import { useState, useEffect, useMemo } from "react";
import { validateBasicDetailsForm, validatePreferencesForm } from "@aotf/lib/validation";

export type UserRole = "guardian" | "teacher" | "freelancer" | "client" | null;
export type ServiceType = "tutorial" | "freelancer" | null;
export type OnboardingStep = "role" | "details" | "verify" | "preferences" | "terms" | "payment" | "complete";

export interface OnboardingFormData {
  role: UserRole;
  serviceType?: ServiceType;
  name: string;
  email: string;
  phone: string;
  grade?: string;
  subjectsOfInterest?: string[];
  learningMode?: string;
  subjectsTeaching?: string[];
  experience?: string;
  qualifications?: string;
  schoolBoard?: string;
  teachingMode?: string;
  bio?: string;
  location: string;
  emailVerified?: boolean;
  isPhoneWhatsApp?: boolean;
  whatsappNumber?: string;
  // Freelancer specific fields
  isWhatsappSameAsPhone?: boolean;
  address?: string;
  experienceLevel?: "beginner" | "intermediate" | "expert" | "";
  maxQualification?: string;
  // Client specific fields
  companyName?: string;
  companyWebsite?: string;
  industry?: string;
}

export function useOnboarding(appType: "tutorials" | "jobs" = "tutorials") {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("role");
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
  const [selectedTerm, setSelectedTerm] = useState<"term-1" | null>("term-1");
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

  // Derived step metadata
  const { totalSteps, stepNumber, stepLabel, progressPct } = useMemo(() => {
    const isTeacher = formData.role === "teacher";
    const isFreelancer = formData.role === "freelancer";
    const stepsOrder: OnboardingStep[] = isTeacher
      ? ["details", "verify", "preferences", "terms", "payment", "complete"]
      : isFreelancer
      ? ["details", "verify", "terms", "payment", "complete"]
      : ["details", "verify", "complete"];

    const labels: Record<OnboardingStep, string> = {
      role: "Choose Role",
      details: "Basic Information",
      verify: "Verify Email",
      preferences: "Preferences",
      terms: "Terms & Conditions",
      payment: "Payment",
      complete: "Complete",
    };

    const totalVisible = isTeacher ? 6 : isFreelancer ? 5 : 3;
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

  const handleRoleSelect = (role: UserRole) => {
    if (role) {
      localStorage.setItem("user", role);
    }
    setFormData({ ...formData, role });
    setCurrentStep("details");
  };

  const completeOnboardingAndRedirect = async () => {
    const destination =
      formData.role === "teacher"
        ? "/teacher"
        : formData.role === "guardian"
        ? "/feed"
        : formData.role === "freelancer"
        ? "/freelancer"
        : formData.role === "client"
        ? "/client"
        : "/";

    window.location.href = destination;
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
        setCurrentStep("terms");
      } else if (formData.role === "client") {
        await handleClientRegistration();
      }
      return;
    }
    if (currentStep === "preferences") {
      setCurrentStep("terms");
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
      setCurrentStep("role");
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
          whatsappNumber: formData.isPhoneWhatsApp ? formData.phone : formData.whatsappNumber
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setCurrentStep("complete");
        await completeOnboardingAndRedirect();
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
          whatsappNumber: formData.isPhoneWhatsApp ? formData.phone : formData.whatsappNumber
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerData.success) {
        setError(registerData.error || "Failed to register teacher");
        setIsLoading(false);
        return;
      }

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

      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.address || "",
        role: formData.role,
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

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
        setCurrentStep("payment");
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

      const basicDetailsValidation = validateBasicDetailsForm({
        phone: formData.phone || "",
        location: formData.address || "",
        role: formData.role,
      });

      if (!basicDetailsValidation.isValid) {
        setError(basicDetailsValidation.errors.join(", "));
        setIsLoading(false);
        return;
      }

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
        await completeOnboardingAndRedirect();
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
    const id = appType === "tutorials" ? teacherId : freelancerId;
    if (!id) {
      setError(`${appType === "tutorials" ? "Teacher" : "Freelancer"} ID is required`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const testPaymentData = {
        razorpay_order_id: `test_order_${Date.now()}`,
        razorpay_payment_id: `test_payment_${Date.now()}`,
        razorpay_signature: `test_signature_${Date.now()}`,
        ...(appType === "tutorials" ? { teacherId: id } : { freelancerId: id }),
      };

      const endpoint = appType === "tutorials" ? "/api/payment/verify" : "/api/payment/verify-freelancer";
      const verifyResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(testPaymentData),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setCurrentStep("complete");
        await completeOnboardingAndRedirect();
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
    const id = appType === "tutorials" ? teacherId : freelancerId;
    if (!id) {
      setError(`${appType === "tutorials" ? "Teacher" : "Freelancer"} ID is required`);
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
      const createEndpoint = appType === "tutorials" 
        ? "/api/payment/create-order" 
        : "/api/payment/create-order-freelancer";
      
      const orderResponse = await fetch(createEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appType === "tutorials" ? { teacherId: id } : { freelancerId: id }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      const description = appType === "tutorials" 
        ? "Teacher Registration Fee" 
        : "Freelancer Registration Fee (₹99)";      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Academy of Tutorials and Freelancers",
        description,
        order_id: orderData.orderId,
        handler: async (response: Record<string, unknown>) => {
          const verifyEndpoint = appType === "tutorials" 
            ? "/api/payment/verify" 
            : "/api/payment/verify-freelancer";
          
          const verifyResponse = await fetch(verifyEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...(appType === "tutorials" ? { teacherId: id } : { freelancerId: id }),
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setCurrentStep("complete");
            await completeOnboardingAndRedirect();
          } else {
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
      } as Record<string, unknown>;

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
    handleRoleSelect,
    handleNext,
    handleBack,
    handleTeacherRegistration,
    handleFreelancerRegistration,
    handleClientRegistration,
    handleGuardianRegistration,
    updateFormData,
    setSelectedTerm,
    setTermsAgreed,
    setError,
    getPaymentTypeDescription,
    initiateTestPayment,
    initiatePayment,
  };
}

declare global {
  interface Window {
    Razorpay: unknown;
  }
}
