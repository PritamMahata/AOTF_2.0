import { BookOpen, Users, GraduationCap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BookOpen,
    title: "Expert Tutors",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Flexible Learning",
    color: "text-secondary",
  },
  {
    icon: GraduationCap,
    title: "Proven Results",
    color: "text-accent",
  },
  {
    icon: GraduationCap,
    title: "Explore Teaching Opportunities",
    color: "text-accent",
    redirect: "/feed",
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
        >
          <feature.icon className={`h-6 w-6 ${feature.color}`} />
          <span className="text-sm font-medium text-foreground">
            {feature.redirect && (
              <Link href={feature.redirect as any} className="hover:underline">
                {feature.title}
              </Link>
            )}
            {!feature.redirect && feature.title}
          </span>
        </div>
      ))}
    </div>
  );
}
