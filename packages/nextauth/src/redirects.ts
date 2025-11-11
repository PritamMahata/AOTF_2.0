// filepath: src/lib/nextauth/redirects.ts
import type { Session } from "next-auth";
import "@aotf/types";

/**
 * Determines the appropriate redirect URL based on user type
 * Used for post-login/signup redirects
 */
export function getUserRedirectUrl(session: Session | null): string {
  const jobsAppUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "https://job.aotf.in";
  const tutorialsAppUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || "https://tutorials.aotf.in";

  // If no session, redirect to main app
  if (!session || !session.user) {
    return process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://aotf.in";
  }

  const userType = session.user.userType;

  // Client → Jobs app client dashboard
  if (userType === "client") {
    console.log(`🔄 Redirecting client to: ${jobsAppUrl}/client/dashboard`);
    return `${jobsAppUrl}/client/dashboard`;
  }

  // Freelancer → Jobs app freelancer dashboard
  if (userType === "freelancer") {
    console.log(`🔄 Redirecting freelancer to: ${jobsAppUrl}/freelancer/dashboard`);
    return `${jobsAppUrl}/freelancer/dashboard`;
  }

  // Teacher → Tutorials app
  if (userType === "teacher") {
    console.log(`🔄 Redirecting teacher to: ${tutorialsAppUrl}/teacher`);
    return `${tutorialsAppUrl}/teacher`;
  }

  // Guardian → Tutorials app
  if (userType === "guardian") {
    console.log(`🔄 Redirecting guardian to: ${tutorialsAppUrl}/guardian`);
    return `${tutorialsAppUrl}/guardian`;
  }

  // Default: Client dashboard (for unspecified types or new users)
  console.log(`🔄 Default redirect to: ${jobsAppUrl}/client/dashboard`);
  return `${jobsAppUrl}/client/dashboard`;
}

/**
 * Client-side redirect helper for use in components
 */
export function redirectToUserDashboard(userType: string | null | undefined) {
  const url = getUserRedirectUrlByType(userType);
  
  if (typeof globalThis !== "undefined" && (globalThis as any)?.window) {
    (globalThis as any).window.location.href = url;
  }
}

/**
 * Get redirect URL by user type (without session object)
 */
export function getUserRedirectUrlByType(userType: string | null | undefined): string {
  const jobsAppUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "https://job.aotf.in";
  const tutorialsAppUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || "https://tutorials.aotf.in";

  switch (userType) {
    case "client":
      return `${jobsAppUrl}/client/dashboard`;
    
    case "freelancer":
      return `${jobsAppUrl}/freelancer/dashboard`;
    
    case "teacher":
      return `${tutorialsAppUrl}/teacher`;
    
    case "guardian":
      return `${tutorialsAppUrl}/guardian`;
    
    default:
      return `${jobsAppUrl}/client/dashboard`;
  }
}
