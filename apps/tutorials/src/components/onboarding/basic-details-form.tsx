import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aotf/ui/components/select";
import { Button } from "@aotf/ui/components/button";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { FormData, EXPERIENCE_LEVELS, SCHOOL_BOARDS } from "@/types/onboarding";
import { validateBasicDetailsForm } from "@aotf/lib/validation";

interface BasicDetailsFormProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BasicDetailsForm({
  formData,
  onFormDataChange,
  onNext,
  onBack,
}: BasicDetailsFormProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Clear validation errors when location changes to revalidate with new rules
  useEffect(() => {
    if (validationErrors.length > 0 && formData.location) {
      // If location is now valid, remove location-related errors
      if (formData.location && formData.location.trim().length >= 3) {
        const nonLocationErrors = validationErrors.filter(
          (error) => !error.toLowerCase().includes("location")
        );
        if (nonLocationErrors.length !== validationErrors.length) {
          setValidationErrors(nonLocationErrors);
        }
      }
    }
  }, [
    formData.location,
    validationErrors,
    formData.phone,
    formData.isPhoneWhatsApp,
    formData.whatsappNumber,
    formData.experience,
    formData.qualifications,
    
    formData.role,
  ]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    onFormDataChange({ [field]: value });
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Format phone number with dashes for display
  const formatPhoneDisplay = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");

    // Format as XXX-XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    // Format partially as user types
    if (cleaned.length > 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length > 3) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }

    return cleaned;
  };

  // Handle phone input change with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/^\+?91\s?/, ""); // Remove +91 if present
    const cleaned = input.replace(/\D/g, ""); // Keep only digits

    // Limit to 10 digits
    if (cleaned.length <= 10) {
      handleInputChange("phone", cleaned);
    }
  };

  // Handle WhatsApp number input change with formatting
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/^\+?91\s?/, ""); // Remove +91 if present
    const cleaned = input.replace(/\D/g, ""); // Keep only digits

    // Limit to 10 digits
    if (cleaned.length <= 10) {
      handleInputChange("whatsappNumber", cleaned);
    }
  };

  const isTeacher = formData.role === "teacher";

  const handleNext = () => {
    // Validate form before proceeding
    const validation = validateBasicDetailsForm({
      phone: formData.phone || "",
      location: formData.location || "",
      isPhoneWhatsApp: formData.isPhoneWhatsApp,
      whatsappNumber: formData.whatsappNumber,
      experience: formData.experience,
      qualifications: formData.qualifications,
      schoolBoard: formData.schoolBoard,
      role: formData.role,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    onNext();
  };

  const requiredOk = () => {
    if (!formData.phone?.trim() || !formData.location?.trim()) return false;

    // Check WhatsApp number requirement
    if (
      formData.isPhoneWhatsApp === false &&
      !formData.whatsappNumber?.trim()
    ) {
      return false;
    }

    if (isTeacher) {
      return !!formData.experience?.trim() && !!formData.qualifications?.trim() && !!formData.schoolBoard?.trim();
    }
    return true;
  };

  const nextDisabled = !requiredOk();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {formData.role === "guardian"
            ? "Guardian Information"
            : "Teacher Information"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tell us a bit about yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationErrors.length > 0 && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center">
              <span className="px-3 py-1.5 border border-r-0 rounded-l-md bg-muted text-foreground select-none">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                value={formatPhoneDisplay(formData.phone || "")}
                onChange={handlePhoneChange}
                placeholder="XXX-XXX-XXXX"
                className="bg-input border-border rounded-l-none"
                maxLength={12} // Account for dashes
              />
            </div>
          </div>
          <div className="space-y-4">
            {/* WhatsApp Number field is shown by default, hidden only if checkbox is checked */}
            {formData.isPhoneWhatsApp !== true && (
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-foreground">
                  WhatsApp Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 border border-r-0 rounded-l-md bg-muted text-foreground select-none">
                    +91
                  </span>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={formatPhoneDisplay(formData.whatsappNumber || "")}
                    onChange={handleWhatsAppChange}
                    placeholder="XXX-XXX-XXXX"
                    className="bg-input border-border rounded-l-none"
                    maxLength={12} // Account for dashes
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPhoneWhatsApp"
            checked={formData.isPhoneWhatsApp || false}
            onCheckedChange={() =>
              handleInputChange("isPhoneWhatsApp", !formData.isPhoneWhatsApp)
            }
          />
          <Label htmlFor="isPhoneWhatsApp" className="text-foreground">
            This phone number is my WhatsApp number
          </Label>
        </div>
        {/* WhatsApp Number Section */}

        <div className="space-y-2">
          <Label htmlFor="location" className="text-foreground">
            Your Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Search for your city or area..."
            className="bg-input border-border"
            type="text"
          />
        </div>
        {formData.role === "teacher" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-foreground">
                Teaching Experience <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.experience || ""}
                onValueChange={(value) =>
                  handleInputChange("experience", value)
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications" className="text-foreground">
                Qualifications <span className="text-red-500">*</span>
              </Label>
              <Input
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) =>
                  handleInputChange("qualifications", e.target.value)
                }
                placeholder="e.g., B.Ed, M.Sc Mathematics, etc."
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolBoard" className="text-foreground">
                School Board <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.schoolBoard || ""}
                onValueChange={(value) =>
                  handleInputChange("schoolBoard", value)
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select the board you completed school from" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_BOARDS.map((board) => (
                    <SelectItem key={board.value} value={board.value}>
                      {board.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={nextDisabled}
            className="bg-primary hover:bg-primary/90"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
