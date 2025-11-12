"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Choose Path Page
 * 
 * After signup on main app (aotf.in), users are redirected here to choose
 * which platform they want to continue to:
 * - Tutorials (tutorials.aotf.in) - for teachers and guardians
 * - Jobs (jobs.aotf.in) - for freelancers and clients
 * 
 * Each platform will handle its own login, session, and onboarding.
 */
export default function ChoosePathPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");

  const tutorialsAppUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || "https://tutorials.aotf.in";
  const jobsAppUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "https://jobs.aotf.in";

  useEffect(() => {
    // Get email from sessionStorage (passed securely after signup)
    const signupEmail = sessionStorage.getItem("signup_email");
    if (signupEmail) {
      setEmail(signupEmail);
      // Don't remove yet - will be used when redirecting to tutorials/jobs
    } else {
      // Fallback: check URL params (for backward compatibility)
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setEmail(emailParam);
      } else {
        // Last fallback: check localStorage
        const localEmail = localStorage.getItem("signup_email");
        if (localEmail) {
          setEmail(localEmail);
          localStorage.removeItem("signup_email"); // Clean up
        }
      }
    }
  }, [searchParams]);

  const handleTutorialsClick = () => {
    // Redirect to Tutorials app login with email pre-filled
    const loginUrl = `${tutorialsAppUrl}/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    // Clean up session storage after redirecting
    sessionStorage.removeItem("signup_email");
    sessionStorage.removeItem("signup_name");
    window.location.href = loginUrl;
  };

  const handleJobsClick = () => {
    // Redirect to Jobs app login with email pre-filled
    const loginUrl = `${jobsAppUrl}/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    // Clean up session storage after redirecting
    sessionStorage.removeItem("signup_email");
    sessionStorage.removeItem("signup_name");
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to AOTF! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your account has been created successfully.
          </p>
          {email && (
            <p className="text-sm text-gray-500">
              Signed up as: <span className="font-medium text-gray-700">{email}</span>
            </p>
          )}
        </div>

        {/* Path Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tutorials Platform */}
          <button
            onClick={handleTutorialsClick}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-blue-500 hover:scale-105"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
            </div>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Tutorials Platform
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For teachers and students/guardians
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Find students or tutors</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Post teaching opportunities</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Manage tutoring sessions</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Continue to Tutorials →
              </span>
            </div>
          </button>

          {/* Jobs Platform */}
          <button
            onClick={handleJobsClick}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-purple-500 hover:scale-105"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full group-hover:bg-purple-500 transition-colors">
                <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Jobs Platform
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For freelancers and clients
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Find freelance opportunities</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Post projects and hire talent</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Manage contracts and payments</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                Continue to Jobs →
              </span>
            </div>
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Don't worry, you can access both platforms anytime with the same account.
          </p>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
