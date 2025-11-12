"use client";

import { useState } from "react";
import { Button } from "@aotf/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Tabs, TabsList, TabsTrigger } from "@aotf/ui/components/tabs";
import { ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { validateLoginForm, validateSignupForm } from "@aotf/lib/validation";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";

interface AuthCardProps {
  onLogin: () => Promise<void> | void;
}

export function AuthCard({ onLogin }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Animate slide direction and tab switching
  const handleTabChange = (value: string) => {
    setError("");
    setValidationErrors([]);
    // Determine slide direction
    if (value === "signup" && isLogin) setDirection(1); // slide left → right
    if (value === "login" && !isLogin) setDirection(-1); // slide right → left
    setIsLogin(value === "login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);

    const validation = validateLoginForm(loginData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("user-credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (!result) {
        setError("Unexpected response from sign-in. Please try again.");
        return;
      }

      if (result.error) {
        const message = result.error === "CredentialsSignin" ? "Invalid email or password" : result.error;
        setError(message || "Login failed");
        return;
      }

      try {
        const sessionResponse = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const sessionUserType = sessionData?.user?.userType ?? null;
          if (sessionUserType) {
            window.localStorage.setItem("user", sessionUserType);
          } else {
            window.localStorage.removeItem("user");
          }
        }
      } catch {
        // Ignore session fetch failures; the session cookie is already set
      }

      onLogin();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);

    const validation = validateSignupForm(signupData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        name: signupData.name,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        // Store email for choose-path page (using POST navigation)
        if (data.user?.email) {
          sessionStorage.setItem("signup_email", data.user.email);
          sessionStorage.setItem("signup_name", data.user.name || "");
        }

        // Navigate to choose-path page
        // Data is now passed via sessionStorage instead of URL params for better security
        window.location.href = "/choose-path";
        return;
      }

      setError(data.error || "Signup failed");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    initial: (dir: 1 | -1) => ({ x: dir * 28, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -28, opacity: 0 }),
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none bg-[#0000]">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl md:text-3xl font-semibold text-indigo-600">
          {isLogin ? "Welcome Back" : "Join Us"}
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-400">
          {isLogin ? "Sign in to your account" : "Create your account to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-white dark:bg-neutral-900 p-4 md:p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          {/* Minimal Tabs header */}
          <Tabs value={isLogin ? "login" : "signup"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg mb-4 bg-neutral-100 dark:bg-neutral-800">
              <TabsTrigger
                onClick={() => handleTabChange("login")}
                value="login"
                className="text-neutral-600 dark:text-neutral-300 data-[state=active]:text-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-700"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleTabChange("signup")}
                value="signup"
                className="text-neutral-600 dark:text-neutral-300 data-[state=active]:text-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-700"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Animated content */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {isLogin ? (
                <motion.form
                  key="login"
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  {validationErrors.length > 0 && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium mb-1">Please fix the following errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        if (validationErrors.length > 0) setValidationErrors([]);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          if (validationErrors.length > 0) setValidationErrors([]);
                        }}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-500 hover:text-indigo-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <div className="text-center">
                    <Link href={"/forgot-password" as Route} className="text-sm text-indigo-600 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  {validationErrors.length > 0 && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium mb-1">Please fix the following errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-700 dark:text-neutral-300">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                      value={signupData.name}
                      onChange={(e) => {
                        setSignupData({ ...signupData, name: e.target.value });
                        if (validationErrors.length > 0) setValidationErrors([]);
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-neutral-700 dark:text-neutral-300">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                      value={signupData.email}
                      onChange={(e) => {
                        setSignupData({ ...signupData, email: e.target.value });
                        if (validationErrors.length > 0) setValidationErrors([]);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-neutral-700 dark:text-neutral-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                        value={signupData.password}
                        onChange={(e) => {
                          setSignupData({ ...signupData, password: e.target.value });
                          if (validationErrors.length > 0) setValidationErrors([]);
                        }}
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-500 hover:text-indigo-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-neutral-700 dark:text-neutral-300">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500"
                        value={signupData.confirmPassword}
                        onChange={(e) => {
                          setSignupData({ ...signupData, confirmPassword: e.target.value });
                          if (validationErrors.length > 0) setValidationErrors([]);
                        }}
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-500 hover:text-indigo-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>

    
  );
}
