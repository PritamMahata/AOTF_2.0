"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-nav";
import "@aotf/ui/globals.css";
import { GeistSans, GeistMono } from "geist/font";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "@aotf/config/src/site";
import { SessionProvider } from "next-auth/react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Always wrap in <html> and <body> as required by Next.js
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/AOTF.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>{`${siteConfig.shortName} - Admin`}</title>
        <style>{`
              html {
                font-family: ${GeistSans.style.fontFamily};
                --font-sans: ${GeistSans.variable};
                --font-mono: ${GeistMono.variable};
              }
            `}
        </style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
          <SessionProvider>
            {isLoginPage ? (
              children
            ) : (
              <AdminAuthGuard>
                <div className="min-h-screen bg-background">
                  <AdminSidebar />
                  <div className="lg:pl-64 pb-16 lg:pb-0">
                    <main className="min-h-screen">{children}</main>
                  </div>
                </div>
              </AdminAuthGuard>
            )}
          </SessionProvider>
      </body>
    </html>
  );
}
