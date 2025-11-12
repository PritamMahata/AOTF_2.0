import { Card, CardContent } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { GraduationCap, ArrowRight } from "lucide-react";

interface CompletionStepProps {
  userRole: "guardian" | "teacher" | "freelancer" | "client";
}

export function CompletionStep({ userRole }: CompletionStepProps) {  const handleDashboardRedirect = () => {
    const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL;
    const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL;
    
    let targetUrl = "";
    
    if (userRole === "guardian") {
      targetUrl = `${tutorialsUrl}/guardian`;
    } else if (userRole === "teacher") {
      targetUrl = `${tutorialsUrl}/teacher`;
    } else if (userRole === "freelancer") {
      targetUrl = `${jobsUrl}/freelancer/dashboard`;
    } else if (userRole === "client") {
      targetUrl = `${jobsUrl}/client/dashboard`;
    }
    
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const getMessage = () => {
    if (userRole === "guardian") {
      return "You can now browse and connect with qualified tutors.";
    } else if (userRole === "teacher") {
      return "You can now start receiving guardian applications and manage your teaching profile.";
    } else if (userRole === "freelancer") {
      return "You can now browse job listings and apply to projects.";
    } else if (userRole === "client") {
      return "You can now post jobs and hire talented freelancers.";
    }
    return "";
  };

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome to Academy of Tutorials!
          </h2>
          <p className="text-lg text-muted-foreground">
            Your profile has been created successfully. {getMessage()}
          </p>
        </div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90"
          onClick={handleDashboardRedirect}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}