import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { BookOpen, Users, ArrowLeft } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: "guardian" | "teacher") => void;
  onBack: () => void;
}

export function RoleSelection({ onRoleSelect, onBack }: RoleSelectionProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-foreground">
          Welcome to AOT Tuition
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Let&apos;s get you started. What brings you here today?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors border-2"
            onClick={() => onRoleSelect("guardian")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <BookOpen className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                I&apos;m a guardian
              </h3>
              <p className="text-muted-foreground">
                Looking for expert tutors to help with my studies
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-secondary transition-colors border-2"
            onClick={() => onRoleSelect("teacher")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <Users className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                I&apos;m a Teacher
              </h3>
              <p className="text-muted-foreground">
                Ready to share my knowledge and help guardians succeed
              </p>            </CardContent>
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