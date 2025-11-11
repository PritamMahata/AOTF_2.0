/**
 * Signup Flow Utilities
 * 
 * Helpers for managing the multi-app signup and login flow.
 * Users sign up on main app, then choose a platform to continue.
 */

/**
 * Get the app URLs from environment variables
 */
export function getAppUrls() {
  return {
    main: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in',
    tutorials: process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in',
    jobs: process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in',
    admin: process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'https://admin.aotf.in',
  };
}

/**
 * Build login URL with email pre-filled
 */
export function buildLoginUrl(app: 'tutorials' | 'jobs', email?: string): string {
  const urls = getAppUrls();
  const baseUrl = app === 'tutorials' ? urls.tutorials : urls.jobs;
  const loginUrl = new URL('/login', baseUrl);
  
  if (email) {
    loginUrl.searchParams.set('email', email);
  }
  
  return loginUrl.toString();
}

/**
 * Build choose-path URL with email
 */
export function buildChoosePathUrl(email?: string): string {
  const urls = getAppUrls();
  const choosePathUrl = new URL('/choose-path', urls.main);
  
  if (email) {
    choosePathUrl.searchParams.set('email', email);
  }
  
  return choosePathUrl.toString();
}

/**
 * Get redirect URL after onboarding based on user type
 */
export function getOnboardingRedirectUrl(userType: string | null | undefined): string {
  switch (userType) {
    case 'teacher':
      return '/teacher';
    case 'guardian':
      return '/feed';
    case 'freelancer':
      return '/freelancer/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Determine which app a user should use based on their type
 */
export function getAppForUserType(userType: string | null | undefined): 'tutorials' | 'jobs' | null {
  switch (userType) {
    case 'teacher':
    case 'guardian':
      return 'tutorials';
    case 'freelancer':
    case 'client':
      return 'jobs';
    default:
      return null;
  }
}
