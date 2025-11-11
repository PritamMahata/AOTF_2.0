import React from "react";
import { Users, BookOpen, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import PerpetualCounter from "@aotf/ui/components/perpetual-counter";

export const Counter = () => {
  const stats = [
    {
      label: "Teachers",
      value: 3000,
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Guardians",
      value: 12000,
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
    },
    {
      label: "Posts",
      value: 4800,
      icon: <BookOpen className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <section className="container px-4 py-12 mx-auto bg-amber-200">
      {/* Heading + Title */}
      <div className="text-center mb-8">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-primary/80">Our Stats</h3>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">Trusted by our community</h2>
      </div>

      {/* Minimal Counters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-8"
      >
        {stats.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-3 px-4"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              {item.icon}
            </div>
            <PerpetualCounter
              startValue={item.value}
              separator="," 
              className="text-4xl md:text-5xl font-bold text-foreground"
            />
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
