import { useState, useEffect } from "react";

export function useHome() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    // Capture optional message from query string (e.g., after redirect)
    const url = new URL(window.location.href);
    const msg = url.searchParams.get('msg');
    if (msg) setMessage(msg);

    checkAuthStatus();
  }, []);
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();

        // Redirects for authenticated users based on status
        if (data.user && data.user.onboardingCompleted === false) {
          const onboardingPath = "/onboarding";
          const message = encodeURIComponent("Please complete onboarding first");
          window.location.href = `${onboardingPath}?msg=${message}`;
          return;
        }
        if (data.user?.userType && data.user.onboardingCompleted) {
          const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002';
          const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'http://localhost:3003';

          if (data.user.userType === 'teacher') {
            window.location.href = `${tutorialsUrl}/teacher`;
          } else if (data.user.userType === 'guardian') {
            window.location.href = `${tutorialsUrl}/guardian`;
          } else if (data.user.userType === 'client') {
            window.location.href = `${jobsUrl}/client/dashboard`;
          } else if (data.user.userType === 'freelancer') {
            window.location.href = `${jobsUrl}/freelancer/dashboard`;
          }
          return;
        }
        // Authenticated but no role and onboarding completed: show home normally
        setIsAuthenticated(false);
      } else {
        const errorBody = await response.json().catch(() => null);
        console.warn('Auth status check failed', {
          status: response.status,
          error: errorBody,
        });
        setIsAuthenticated(false);
      }
    } catch (error) {
      // User not authenticated, stay on home page
      console.error("Auth Check Error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }; const handleLogin = async () => {
    // Check user status after login to determine redirect
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL;
        const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL;
        const onboardingUrl = "/onboarding";

        if (data.user && data.user.onboardingCompleted === false) {
          window.location.href = `${onboardingUrl}?msg=${encodeURIComponent("Please complete onboarding first")}`;
          return;
        }
        else if (data.user?.userType) {
          // User has completed onboarding, redirect to their dashboard
          if (data.user.userType === 'teacher') {
            window.location.href = `${tutorialsUrl}/teacher`;
          } else if (data.user.userType === 'guardian') {
            window.location.href = `${tutorialsUrl}/guardian`;
          } else if (data.user.userType === 'client') {
            window.location.href = `${jobsUrl}/client/dashboard`;
          } else if (data.user.userType === 'freelancer') {
            window.location.href = `${jobsUrl}/freelancer/dashboard`;
          }
        } else {
          // User hasn't completed onboarding, redirect to onboarding with message
          window.location.href = `${onboardingUrl}?msg=${encodeURIComponent("Please complete onboarding first")}`;
        }
      } else {
        const errorBody = await response.json().catch(() => null);
        console.warn('Auth check during login failed', {
          status: response.status,
          error: errorBody,
        });
        // Fallback to onboarding if auth check fails
        window.location.href = "/onboarding";
      }
    } catch (error) {
      // Fallback to onboarding if there's an error
      console.error("Login Redirect Error:", error);
      window.location.href = "/";
    }
  };

  return {
    handleLogin,
    isAuthenticated,
    isLoading,
    message,
  };
}