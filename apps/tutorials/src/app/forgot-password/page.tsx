"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { NormalAppHeader } from "@aotf/ui/navigation/app-header";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@aotf/ui/components/input-otp";
import { validateEmail, validatePassword } from "@aotf/lib/validation";



export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send reset code");
      }
      setMessage("We've sent a 6-digit code to your email. Enter it below with your new password.");
      setStep("verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    const passValidation = validatePassword(newPassword);
    if (!passValidation.isValid) {
      setError(passValidation.errors[0]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password");
      }
      setMessage("Password reset successful. Redirecting to sign in...");
      // Redirect to login after a short delay so the user sees the success state
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NormalAppHeader />
      <div className="h-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Forgot Password Form */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl ">Reset Password</CardTitle>
              <CardDescription>
                {step === "request" ? "Enter your email to receive a reset code" : `Enter the code sent to ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}
              {message && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">{message}</div>
              )}
              {step === "request" ? (
                <form onSubmit={requestCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Sending Code...</>) : 'Send Reset Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reset Code</Label>
                    <InputOTP
                      value={code}
                      onChange={setCode}
                      maxLength={6}
                      containerClassName="gap-2"
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} minLength={6} required disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} minLength={6} required disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Resetting...</>) : 'Reset Password'}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    <button type="button" className="hover:underline" onClick={async ()=>{ setIsLoading(true); setError(null); setMessage(null); try { const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })}); const d = await r.json(); if (!r.ok || !d.success) throw new Error(d.error || 'Failed to resend code'); setMessage('Code resent. Check your inbox.'); } catch(e){ const msg = e instanceof Error ? e.message : 'Failed to resend'; setError(msg); } finally { setIsLoading(false); } }}>Resend code</button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
