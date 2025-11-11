import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Label } from "@aotf/ui/components/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@aotf/ui/components/input-otp";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

interface EmailVerificationStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerificationStep({ email, onVerified, onBack }: EmailVerificationStepProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isBounced, setIsBounced] = useState(false);
  const [checkingBounce, setCheckingBounce] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hasSentInitialOtpRef = useRef(false);
  const isSendingRef = useRef(false);
  const bouncePollRef = useRef<number | null>(null);
  const bouncePollStopRef = useRef<number | null>(null);
  const isBouncedRef = useRef(false);

  useEffect(() => {
    isBouncedRef.current = isBounced;
  }, [isBounced]);

  // Timer countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    timerRef.current = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  // Auto-fill from URL ?code=XXXXXX if present
  useEffect(() => {
    const url = new URL(window.location.href);
    const urlCode = url.searchParams.get("code");
    if (urlCode && urlCode.length === 6) setCode(urlCode);
  }, []);

  // Helper: check bounce status via API
  const checkBounceStatus = useCallback(async () => {
    if (!email) return { bounced: false } as const;
    try {
      setCheckingBounce(true);
      const res = await fetch(`/api/auth/email-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      const bounced = Boolean(data?.bounced);
      setIsBounced(bounced);
      if (bounced) {
        setError(
          data?.reason
            ? `We can't use this email address due to security reasons (bounced: ${String(data.reason)}). Please change the email address and continue.`
            : `We can't use this email address due to security reasons (bounced). Please change the email address and continue.`
        );
      }
      return { bounced } as const;
    } catch {
      // Non-fatal; don’t override existing error
      return { bounced: false } as const;
    } finally {
      setCheckingBounce(false);
    }
  }, [email]);

  // Memoize sendOtp to avoid unnecessary re-creation on every render
  const sendOtp = useCallback(async () => {
    // Prevent duplicate calls
    if (isSendingRef.current) {
      console.log('[sendOtp] Already sending, skipping duplicate call');
      return;
    }
    
    isSendingRef.current = true;
    setError(null);
    // Clear any previous polling timers
    if (bouncePollRef.current) window.clearInterval(bouncePollRef.current);
    if (bouncePollStopRef.current) window.clearTimeout(bouncePollStopRef.current);
    
    try {
      console.log('[sendOtp] Sending OTP to:', email);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send code");
        return;
      }
      console.log('[sendOtp] OTP sent successfully');

      // After sending, check for potential bounce and briefly poll for late bounce events
      const first = await checkBounceStatus();
      if (!first.bounced) {
        bouncePollRef.current = window.setInterval(async () => {
          const res = await checkBounceStatus();
          if (res.bounced) {
            if (bouncePollRef.current) window.clearInterval(bouncePollRef.current);
            if (bouncePollStopRef.current) {
              window.clearTimeout(bouncePollStopRef.current);
              bouncePollStopRef.current = null;
            }
          }
        }, 5000);
        // Stop polling after 30s
        bouncePollStopRef.current = window.setTimeout(() => {
          if (bouncePollRef.current) {
            window.clearInterval(bouncePollRef.current);
            bouncePollRef.current = null;
          }
        }, 30000) as unknown as number;
      }
    } catch {
      setError("Failed to send code. Try again.");
    } finally {
      isSendingRef.current = false;
    }
  }, [email,checkBounceStatus]);

  // Auto-send OTP when entering step (only once)
  useEffect(() => {
    if (!email || hasSentInitialOtpRef.current) return;

    // Extra client-side guard for dev StrictMode double-mount:
    // Use sessionStorage to ensure we don't send twice within 30s for the same email
    try {
      const key = `otp-sent-at:${email}`;
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      if (last && now - Number(last) < 30_000) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[EmailVerificationStep] Skipping initial OTP due to recent send');
        }
        hasSentInitialOtpRef.current = true; // prevent further attempts
        return;
      }
      sessionStorage.setItem(key, String(now));
    } catch {}

    console.log('[EmailVerificationStep] Sending initial OTP');
    hasSentInitialOtpRef.current = true;
    setResendCooldown(30);
    sendOtp();
  }, [email, sendOtp]);

  // On mount or email change, proactively check if address is already bounced
  useEffect(() => {
    if (!email) return;
    checkBounceStatus();
    return () => {
      if (bouncePollRef.current) window.clearInterval(bouncePollRef.current);
    };
  }, [email, checkBounceStatus]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
    setResendCooldown(30);
  };

  const handleVerify = async () => {
    if (isBounced) return;
    if (code.length !== 6) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid or expired code");
        return;
      }
      // onVerified may trigger async flows (e.g. registration). Normalize and await
      await Promise.resolve(onVerified());
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      // Always release the loading state in case the step doesn't change
      setIsSubmitting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = (text || "").replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) setCode(digits);
    } catch {}
  };

  // Dev helper UI removed: we no longer expose OTP in the client.

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Verify your Email</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isBounced ? (
            <>
              Unable to send verification code to <span className="font-medium">{email}</span>. 
              This email address cannot receive messages.
            </>
          ) : (
            <>
              We sent a 6-digit verification code to <span className="font-medium">{email}</span>.
              {checkingBounce ? (
                <span className="ml-2 text-xs text-muted-foreground">(checking delivery status...)</span>
              ) : null}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
        )}



        <div className="space-y-2">
          <Label className="text-foreground">Enter verification code</Label>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(val) => setCode(val.replace(/\D/g, "").slice(0, 6))}
            render={() => (
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            )}
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handlePasteFromClipboard} disabled={isBounced}>
              Paste code
            </Button>
            <Button type="button" variant="ghost" disabled={resendCooldown > 0 || isBounced} onClick={handleResend}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </Button>
          </div>
          {isBounced && (
            <div className="text-sm text-foreground/80">
              You cannot use this email address due to security reasons. Please go back and change the email address to continue.
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleVerify} disabled={isBounced || code.length !== 6 || isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? "Verifying..." : (
              <>
                Verify
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}