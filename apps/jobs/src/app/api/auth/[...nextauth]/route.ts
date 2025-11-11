import { jobsAuthHandlers } from "@aotf/nextauth/src/user";

/**
 * NextAuth Route Handler for Jobs App
 * 
 * Configuration:
 * - Cookie name: jobs-auth-token
 * - Cookie domain: jobs.aotf.in (production) or undefined (localhost)
 * - Isolated from main and tutorials apps
 * - Handles freelancer and client authentication
 */
export const { GET, POST } = jobsAuthHandlers;
