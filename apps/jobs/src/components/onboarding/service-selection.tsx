import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { GraduationCap, Briefcase, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ServiceSelectionProps {
  onServiceSelect: (service: "tutorial" | "freelancer") => void;
  onCancel?: () => void;
}

export function ServiceSelection({ onServiceSelect, onCancel }: ServiceSelectionProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelRegistration = async () => {
    setIsCancelling(true);

    try {
      const response = await fetch("/api/auth/cancel-registration", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Registration cancelled successfully");
        window.localStorage.removeItem("user");
        if (onCancel) {
          onCancel();
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(data.error || "Failed to cancel registration");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-foreground">
          Welcome to Academy of Tutorials
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          What service are you looking for?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors border-2"
            onClick={() => onServiceSelect("tutorial")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <GraduationCap className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Tutorial
              </h3>
              <p className="text-muted-foreground">
                Find tutors or become a teacher to help students succeed
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-secondary transition-colors border-2"
            onClick={() => onServiceSelect("freelancer")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <Briefcase className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Freelancer
              </h3>
              <p className="text-muted-foreground">
                Find freelance work or post jobs for talented professionals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cancel Registration Button */}
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            onClick={handleCancelRegistration}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Registration
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will delete your account permanently
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
