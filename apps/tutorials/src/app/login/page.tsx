"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Tutorials App Login Page
 * 
 * Handles login for teachers and guardians.
 * Email can be pre-filled from signup flow on main app.
 * After login, redirects to onboarding if not completed, otherwise to feed.
 */
export default function TutorialsLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://aotf.in";

  useEffect(() => {
    // Pre-fill email if passed from signup
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSignupRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to main app signup page
    // Using window.location for cross-domain navigation
    window.location.href = `${mainAppUrl}/signup`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("user-credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Give a small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use NextAuth's getSession to ensure proper session retrieval
        const session = await getSession();

        if (session?.user) {
          // Check if onboarding is completed
          if (!session.user.onboardingCompleted) {
            // Redirect to onboarding flow
            router.push("/onboarding");
          } else {
            // Check user type and redirect accordingly
            const userType = session.user.userType;
            
            if (userType === "teacher") {
              router.push("/teacher");
            } else if (userType === "guardian") {
              router.push("/feed");
            } else {
              // Default to feed
              router.push("/feed");
            }
          }
        } else {
          // Session not available yet, try to refresh
          console.log("Session not available, refreshing...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retrySession = await getSession();
          
          if (retrySession?.user) {
            if (!retrySession.user.onboardingCompleted) {
              router.push("/onboarding");
            } else {
              const userType = retrySession.user.userType;
              if (userType === "teacher") {
                router.push("/teacher");
              } else if (userType === "guardian") {
                router.push("/feed");
              } else {
                router.push("/feed");
              }
            }
          } else {
            // If still no session, force a page reload to trigger session sync
            window.location.href = "/feed";
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Tutorials
          </h1>
          <p className="text-gray-600">
            Login to connect with students and teachers
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleSignupRedirect}
                className="text-blue-600 hover:text-blue-700 font-medium underline bg-transparent border-none cursor-pointer"
              >
                Sign up on AOTF
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
