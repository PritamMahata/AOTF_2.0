import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@aotf/ui/globals.css";
import { GeistSans, GeistMono } from "geist/font";
import BottomNav from "@/components/navigation/bottom-nav";
import { Toaster } from "sonner";
import { siteConfig } from "@aotf/config/src/site";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";

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

export const metadata: Metadata = {
  title: siteConfig.shortName,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/AOTF.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
          <AuthSessionProvider>
            {children}
            <BottomNav />
            <Toaster richColors position="top-center" />
          </AuthSessionProvider>
      </body>
    </html>
  );
}
