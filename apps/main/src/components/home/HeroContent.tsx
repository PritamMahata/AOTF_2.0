"use client";
import { motion } from "framer-motion";
// import { FeaturesGrid } from "./FeaturesGrid";
import { siteConfig } from "@aotf/config";
export function HeroContent() {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-left space-y-4"
      >
        <h2 className="text-2xl lg:text-5xl font-bold tracking-tight text-foreground">
          {siteConfig.subDescription}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-l">
          {siteConfig.description}
        </p>
      </motion.div>
      {/* Features Section */}
      {/* <FeaturesGrid /> */}
    </div>
  );
}
