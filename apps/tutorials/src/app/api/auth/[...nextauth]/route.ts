import { tutorialsAuthHandlers } from "@aotf/nextauth/src/user";

/**
 * NextAuth Route Handler for Tutorials App
 * 
 * Configuration:
 * - Cookie name: tutorials-auth-token
 * - Cookie domain: tutorials.aotf.in (production) or undefined (localhost)
 * - Isolated from main and jobs apps
 * - Handles teacher and guardian authentication
 */
export const { GET, POST } = tutorialsAuthHandlers;
