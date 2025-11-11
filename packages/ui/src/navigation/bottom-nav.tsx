"use client";
import React from "react";
import { Users, LayoutDashboard, User, Home,} from "lucide-react";
import Link from "next/link";
import { cn } from "@aotf/lib/utils";
import { usePathname } from "next/navigation";
import { motion, easeOut, easeIn } from "framer-motion";
// import { useTheme } from "next-themes";

const BottomNav = () => {
  const pathname = usePathname();
  // const { theme, setTheme } = useTheme();
  const [dashboardHref, setDashboardHref] = React.useState("/guardian");
  const [profileHref, setProfileHref] = React.useState("/guardian/profile");
  const [mounted, setMounted] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let canceled = false;
    const init = async () => {
      setMounted(true);
      let role: string | null = null;
      try {
        role = window.localStorage.getItem("user");
      } catch {}
      if (!role) {
        try {
          const resp = await fetch("/api/auth/me", { credentials: "include" });
          if (resp.ok) {
            const data = await resp.json();
            role = data?.user?.userType || null;
            setIsAuthenticated(true);
          }
        } catch {}
      } else {
        setIsAuthenticated(true);
      }
      if (canceled) return;
      const isTeacher = role === "teacher";
      setDashboardHref(isTeacher ? "/teacher" : "/guardian");
      setProfileHref(isTeacher ? "/teacher/profile" : "/guardian/profile");
    };
    init();
    return () => {
      canceled = true;
    };
  }, []);

  const isActive = React.useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      if (href === dashboardHref) {
        return (
          pathname === href ||
          (pathname.startsWith(href + "/") &&
            !pathname.startsWith(profileHref))
        );
      }
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname, dashboardHref, profileHref]
  );

  const hideOnRoutes = ["/onboarding"];
  if (hideOnRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }
  const navigationItems = [
    { name: "Feed", href: "/feed", icon: Users, external: true },
    { name: "Applications", href: dashboardHref, icon: LayoutDashboard, external: true },
    { name: "Profile", href: profileHref, icon: User, external: true },
  ];

  const LandingPageItems = [
    { name: "Home", href: "/", icon: Home, external: false },
    { name: "Feed", href: "/feed", icon: Users, external: true },
    { name: "About", href: "/about", icon: LayoutDashboard, external: false },
    { name: "Contact", href: "/contact", icon: User, external: false },
    // { name: "Privacy", href: "/privacy-policy", icon: Cookie },
  ];
  const itemsToShow = isAuthenticated ? navigationItems : LandingPageItems;

  // const toggleTheme = () => {
  //   setTheme(theme === 'dark' ? 'light' : 'dark');
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } }}
      exit={{ opacity: 0, y: 30, transition: { duration: 0.3, ease: easeIn } }}
      className="rounded-xl m-auto w-fit fixed bottom-2.5 md:bottom-12 left-0 right-0 z-40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs border-t border-sidebar-border shadow-md"
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      <div
        className="relative gap-1 px-2 py-1"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${itemsToShow.length}, minmax(0, 1fr))`,
        }}
      >        {itemsToShow.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://localhost:3002';
          const finalHref = item.external ? `${tutorialsUrl}${item.href}` : item.href;
          const isExternalLink = item.external;

          const content = (
            <>
              {/* Active background slider */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-sidebar-accent rounded-md z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon and label */}
              <motion.div
                className={cn(
                  "relative z-10 flex flex-col items-center justify-center transition-colors",
                  active
                    ? "text-sidebar-accent-foreground"
                    : "hover:text-zinc-950/40 dark:hover:text-white"
                )}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </motion.div>
            </>
          );

          if (isExternalLink) {
            return (
              <a
                key={item.name}
                href={finalHref}
                className="relative flex flex-col items-center justify-center py-2 px-1 rounded-md text-sidebar-foreground"
              >
                {content}
              </a>
            );
          }          return (
            <Link
              key={item.name}
              href={item.href as any}
              className="relative flex flex-col items-center justify-center py-2 px-1 rounded-md text-sidebar-foreground"
            >
              {content}
            </Link>
          );
        })}
        
        {/* Theme Toggle Button */}
        {/* <button
          onClick={toggleTheme}
          className="relative flex flex-col items-center justify-center py-2 px-1 rounded-md text-sidebar-foreground"
        >
          <motion.div
            className={cn(
              "relative z-10 flex flex-col items-center justify-center transition-colors",
              "hover:text-sidebar-accent-foreground"
            )}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            {mounted && (
              <>
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="text-xs mt-1 font-medium">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              </>
            )}
          </motion.div>
        </button> */}
      </div>
    </motion.div>
  );
};

export default BottomNav;
