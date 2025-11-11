"use client";

import { useEffect } from "react";

/**
 * Tutorials App Home Page
 * 
 * This page redirects users to the main app since the tutorials app
 * is exclusively for authenticated users (feed, teacher, guardian pages).
 * All landing page functionality is in the main app.
 */
export default function HomePage() {
  useEffect(() => {
    // Redirect to main app
    const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3000";
    window.location.href = mainAppUrl;
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
