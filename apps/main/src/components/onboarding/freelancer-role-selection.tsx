import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { UserCircle, Building2, ArrowLeft } from "lucide-react";

interface FreelancerRoleSelectionProps {
  onRoleSelect: (role: "freelancer" | "client") => void;
  onBack: () => void;
}

export function FreelancerRoleSelection({ onRoleSelect, onBack }: FreelancerRoleSelectionProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-foreground">
          Freelancer Service
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Are you looking for work or hiring?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors border-2"
            onClick={() => onRoleSelect("freelancer")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <UserCircle className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                I&apos;m a Freelancer
              </h3>
              <p className="text-muted-foreground">
                Looking for freelance opportunities and projects
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-secondary transition-colors border-2"
            onClick={() => onRoleSelect("client")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <Building2 className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                I&apos;m a Client
              </h3>
              <p className="text-muted-foreground">
                Ready to post jobs and hire talented freelancers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
