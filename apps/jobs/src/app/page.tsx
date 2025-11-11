"use client";

import Link from "next/link";
import { Briefcase, Users, FileText } from "lucide-react";
import { Route } from "next";

/**
 * Jobs App Home Page
 * 
 * Development homepage for the Jobs app.
 * Shows quick navigation to main features.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Jobs & Freelance Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Development Environment - Authentication Disabled
          </p>
        </div>        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Projects Feed Card */}
          <Link
            href={"/posts" as Route}
            className="group p-6 bg-card rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Browse Projects</h2>
              <p className="text-muted-foreground">
                Explore available freelance projects
              </p>
            </div>
          </Link>

          {/* Freelancers Card */}
          <Link
            href={"/freelancer" as Route}
            className="group p-6 bg-card rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Freelancer Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your applications and profile
              </p>
            </div>
          </Link>

          {/* Client Dashboard Card */}
          <Link
            href="/client"
            className="group p-6 bg-card rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Client Dashboard</h2>
              <p className="text-muted-foreground">
                Post projects and hire freelancers
              </p>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-12 max-w-3xl mx-auto p-6 bg-muted/50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Development Mode Active</h3>
          <p className="text-muted-foreground mb-4">
            Authentication is disabled. All routes are accessible for frontend development.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
              ✓ No Login Required
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm">
              ✓ All Routes Open
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full text-sm">
              ✓ Mock Data Ready
            </span>
          </div>
        </div>        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={"/freelancer/profile" as Route} className="text-sm text-primary hover:underline">
              Freelancer Profile
            </Link>
            <Link href={"/client/profile" as Route} className="text-sm text-primary hover:underline">
              Client Profile
            </Link>
            <Link href={"/freelancer/applications" as Route} className="text-sm text-primary hover:underline">
              Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
