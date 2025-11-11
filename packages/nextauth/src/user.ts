import NextAuth from "next-auth";
import { createAuthConfig } from "./config";
import type { AppName } from "./config";

/**
 * Create NextAuth configuration for Tutorials app
 * - Isolated session with cookie: tutorials-auth-token
 * - Cookie domain restricted to tutorials.aotf.in
 */
export function createTutorialsAuthConfig() {
  return createAuthConfig({ 
    audience: "user",
    appName: "tutorials",
  });
}

/**
 * Create NextAuth configuration for Jobs app
 * - Isolated session with cookie: jobs-auth-token
 * - Cookie domain restricted to jobs.aotf.in
 */
export function createJobsAuthConfig() {
  return createAuthConfig({ 
    audience: "user",
    appName: "jobs",
  });
}

/**
 * Legacy: Generic user auth config (deprecated - use app-specific configs)
 */
export const getUserAuthConfig = () => {
  return createAuthConfig({ audience: "user" });
};

/**
 * Create auth handlers for a specific app
 */
export function createUserAuthHandlers(appName: AppName) {
  const config = createAuthConfig({ audience: "user", appName });
  const handler = NextAuth(config);
  return { GET: handler, POST: handler };
}

// Tutorials app handlers
export const tutorialsAuthConfig = createTutorialsAuthConfig();
export const tutorialsAuthHandlers = createUserAuthHandlers("tutorials");

// Jobs app handlers
export const jobsAuthConfig = createJobsAuthConfig();
export const jobsAuthHandlers = createUserAuthHandlers("jobs");

// Legacy export
export const userAuthHandlers = createUserAuthHandlers("main");
