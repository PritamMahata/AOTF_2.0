"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@aotf/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// ✨ Floating Particle Background (Circular and Smooth)
const ParticleBackground = () => {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        size: 4 + Math.random() * 10, // pixel size of each particle
        top: Math.random() * 100, // vertical position
        left: Math.random() * 100, // horizontal position
        duration: 6 + Math.random() * 6, // animation speed
        delay: Math.random() * 5, // start delay
        opacity: 0.04 + Math.random() * 0.08,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: 0, opacity: p.opacity }}
          animate={{ y: [-10, 10, -10], opacity: [p.opacity, p.opacity + 0.05, p.opacity] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
          }}
          className="absolute rounded-full bg-indigo-400/20 blur-sm"
        />
      ))}
    </div>
  );
};

export default function Hero() {
  return (
    <section
      id="section"
      className="relative bg-linear-to-b from-[#F5F7FF] via-[#FFFDF5] to-[#E6EFFF] px-4 sm:px-8 py-8"
    >
      <ParticleBackground />

      <main className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45 }}
          className="mt-2 text-indigo-600 font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl"
        >
          One Platform, <span className="text-orange-400">Endless Possibilities.</span>
        </motion.h2>



        <p className="mt-4 text-center text-gray-600 max-w-md text-sm sm:text-base leading-relaxed">
          Learn why professionals trust our solution to complete their customer journey.
        </p>        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Button 
            size="lg" 
            asChild 
            className="bg-orange-300 text-[#000000ce] hover:bg-[#d9944a]"
            onClick={() => {
              const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002';
              window.location.href = `${tutorialsUrl}/feed`;
            }}
          >
            <Link href={`${process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002'}/feed` as any}>
              Explore Teaching Opportunity <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            asChild 
            className="bg-orange-300 text-[#000000ce] hover:bg-[#d9944a]"
            onClick={() => {
              const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002';
              window.location.href = `${tutorialsUrl}/feed`;
            }}
          >
            <Link href={`${process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002'}/feed` as any}>
              Explore Freelancing Opportunity <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>
      </main>
    </section>
  );
}
