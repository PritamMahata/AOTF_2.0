import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Label } from "@aotf/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@aotf/ui/components/radio-group";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { Textarea } from "@aotf/ui/components/textarea";
import { Button } from "@aotf/ui/components/button";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

import { FormData, SUBJECTS, LEARNING_MODES } from "@/types/onboarding";
import { validatePreferencesForm } from "@aotf/lib/validation";

interface PreferencesFormProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

export function PreferencesForm({ formData, onFormDataChange, onNext, onBack, isLoading, error }: PreferencesFormProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubjectToggle = (subject: string, type: "interest" | "teaching") => {
    const key = type === "interest" ? "subjectsOfInterest" : "subjectsTeaching";
    const currentSubjects = formData[key] || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    onFormDataChange({ [key]: updatedSubjects });
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleModeChange = (value: string) => {
    const key = formData.role === "guardian" ? "learningMode" : "teachingMode";
    onFormDataChange({ [key]: value });
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleBioChange = (value: string) => {
    onFormDataChange({ bio: value });
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNext = () => {
    // Validate form before proceeding
    const validation = validatePreferencesForm({
      subjectsOfInterest: formData.subjectsOfInterest,
      subjectsTeaching: formData.subjectsTeaching,
      learningMode: formData.learningMode,
      teachingMode: formData.teachingMode,
      bio: formData.bio,
      role: formData.role
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {formData.role === "guardian" ? "Learning Preferences" : "Teaching Preferences"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Help us match you with the right{" "}
          {formData.role === "guardian" ? "tutors" : "guardians"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="space-y-4">
          <Label className="text-foreground text-base font-medium">
            {formData.role === "guardian" ? "Subjects of Interest" : "Subjects You Teach"}<span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  className="border-zinc-800"
                  checked={(formData.role === "guardian"
                    ? formData.subjectsOfInterest
                    : formData.subjectsTeaching
                  )?.includes(subject)}
                  onCheckedChange={() =>
                    handleSubjectToggle(
                      subject,
                      formData.role === "guardian" ? "interest" : "teaching"
                    )
                  }
                />
                <Label
                  htmlFor={subject}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-foreground text-base font-medium">
            {formData.role === "guardian"
              ? "Preferred Learning Mode"
              : "Teaching Mode Preference"}
              <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={
              formData.role === "guardian"
                ? formData.learningMode || ""
                : formData.teachingMode || ""
            }
            onValueChange={handleModeChange}
          >
            {LEARNING_MODES.map((mode) => (
              <div key={mode.value} className="flex items-center space-x-2">
                <RadioGroupItem value={mode.value} id={mode.value} className="border-zinc-800" />
                <Label htmlFor={mode.value} className="text-foreground">
                  {mode.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.role === "teacher" && (
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">
              Bio/Description
            </Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Tell guardians about your teaching style and experience..."
              className="bg-input border-border min-h-[100px]"
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              "Processing..."
            ) : formData.role === "guardian" ? (
              <>
                Complete Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 