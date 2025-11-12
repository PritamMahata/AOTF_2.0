import { Card, CardContent } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
// import { PAYMENT_TERMS } from "@/types/onboarding";
import Link from "next/link";
import { siteConfig } from "@aotf/config/src/site";

interface TermsStepProps {
  selectedTerm: "term-1" | null;
  termsAgreed: boolean;
  isLoading: boolean;
  error?: string;
  userName?: string;
  onTermSelect: (term: "term-1") => void;
  onTermsAgreed: (agreed: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TermsStep({
  selectedTerm,
  termsAgreed,
  isLoading,
  error,
  userName, // Add this
  // onTermSelect,
  onTermsAgreed,
  onNext,
  onBack,
}: TermsStepProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Additional Terms */}
        <div className="bg-muted/50 rounded-xl md:p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Dear {userName || "User"},
          </h2>
          <p className="text-gray-700 mb-3">
            We kindly request you to complete your registration fee payment and
            confirm your agreement to the consultancy terms as outlined below:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
            <li>
              The academy will deduct 75% of the first month&apos;s tuition fee as
              consultancy charges.
            </li>
            <li>You&apos;ll receive the remaining 25%, paid by the academy.</li>
            <li>
              From the second month onward, you&apos;ll collect the full fee directly
              from the guardian.
            </li>
          </ul>
          <h5 className="text-x font-semibold mb-4 text-foreground mt-5">
            Please acknowledge your agreement to these terms and proceed with
            the registration fee payment to confirm your engagement.
            <br />
            <br />
            <span className="font-bold">
              Thank you for your understanding and cooperation.
            </span>
          </h5>

          <p className="text-gray-800 font-medium">
            Warm regards,
            <br />
            {siteConfig.ceo}
          </p>
          <p className="text-gray-800 font-medium">{siteConfig.name}</p>
          <p className="text-gray-800 font-medium">
            Contact: {siteConfig.contact.phone}
          </p>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center space-x-3 p-3 bg-primary/20 rounded-xl">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => onTermsAgreed(e.target.checked)}
            className="w-5 h-5 text-primary"
          />
          <label
            className="text-foreground font-medium"
            htmlFor="terms-checkbox"
          >
            I have read and agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-primary underline"
            >
              terms and conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-primary underline"
            >
              privacy policy
            </Link>
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedTerm || !termsAgreed || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Processing..." : "Accept Terms & Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
