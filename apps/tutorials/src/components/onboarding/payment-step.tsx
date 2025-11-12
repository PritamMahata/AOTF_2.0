import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@aotf/config/src/site";

interface PaymentStepProps {
  teacherId: string | null;
  selectedTerm: "term-1" | null;
  // selectedTerm: "term-1" | "term-2" | null;
  isLoading: boolean;
  scriptLoaded: boolean;
  isDevelopment: boolean;
  error?: string;
  getPaymentTypeDescription: () => string;
  onInitiatePayment: () => void;
  onInitiateTestPayment: () => void;
  onBack: () => void;
}

export function PaymentStep({
  teacherId,
  selectedTerm,
  isLoading,
  scriptLoaded,
  isDevelopment,
  error,
  getPaymentTypeDescription,
  onInitiatePayment,
  onInitiateTestPayment,
  onBack,
}: PaymentStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Complete Registration
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Pay the registration fee to activate your teaching profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teacher ID Display */}
        <div className="bg-muted/50 border border-primary rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your Teacher ID</p>
          <code className="text-xl font-mono text-primary">{teacherId}</code>
        </div>

        {/* Selected Terms Display */}
        <div className="bg-muted/50 border border-green-500 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Selected Payment Option
          </p>
          <p className="text-green-600 font-medium">
            {getPaymentTypeDescription()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Terms agreed: {selectedTerm?.toUpperCase()}
          </p>
        </div>

        {/* Registration Fee */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Registration Fee</p>
          <p className="text-4xl font-bold text-green-600">₹{siteConfig.payment.registrationFee}</p>
          <p className="text-sm text-muted-foreground">
            Complete your payment to activate your teaching account and start
            connecting with guardians.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <Button
          size="lg"
          onClick={onInitiatePayment}
          disabled={isLoading || !scriptLoaded}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 mb-4"
        >
          {!scriptLoaded
            ? "Loading Payment Gateway..."
            : isLoading
            ? "Processing..."
            : `Pay ₹${siteConfig.payment.registrationFee} & Complete Registration`}
        </Button>

        {/* Test Payment Button (Development Only) */}
        {isDevelopment && (
          <Button
            onClick={onInitiateTestPayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 mb-4"
          >
            {isLoading ? "Processing..." : "🧪 Test Payment (Dev Mode)"}
          </Button>
        )}

        {/* Back Button */}
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft size={16} className="mr-2" />
          Back to Preferences
        </Button>
      </CardContent>
    </Card>
  );
} 