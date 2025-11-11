"use client";

import Hero from "@/components/home/Hero";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";
import { HeroContent } from "@/components/home/HeroContent";
import { AuthCard } from "@/components/home/AuthCard";
import { Counter } from "@/components/Counter";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

import { useHome } from "@aotf/ui/hooks/use-home";
import { useEffect } from "react";

export default function HomePage() {
    
  const { handleLogin, isAuthenticated, isLoading, message } = useHome();

  useEffect(() => {
    if (message) {
      // Lazy import to avoid SSR issues
      import('sonner').then(({ toast }) => toast.error(message));
    }
  }, [message]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, this will redirect automatically via useHome hook
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background">
      <NormalAppHeader />
      <Hero />
      <main className="container mx-auto sm:my-5 px-5 py-5 w-full bg-amber-400/10 rounded-2xl">
        <div className="container m-auto w-full flex flex-col items-center  md:flex-row gap-10">
          {/* Hero Section */}
          <HeroContent />
          {/* Authentication Card */}
          <AuthCard onLogin={handleLogin} />
        </div>
      </main>
      <Counter />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
