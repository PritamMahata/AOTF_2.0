import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Textarea } from "@aotf/ui/components/textarea";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface FreelancerFormData {
  phone: string;
  whatsappNumber: string;
  isWhatsappSameAsPhone: boolean;
  address: string;
  experience: string;
  experienceLevel: "beginner" | "intermediate" | "expert" | "";
  maxQualification: string;
  schoolBoard: string;
}

interface FreelancerDetailsFormProps {
  formData: FreelancerFormData;
  onChange: (data: Partial<FreelancerFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function FreelancerDetailsForm({ 
  formData, 
  onChange, 
  onNext, 
  onBack,
  isLoading = false 
}: FreelancerDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleWhatsappCheckboxChange = (checked: boolean) => {
    onChange({
      isWhatsappSameAsPhone: checked,
      whatsappNumber: checked ? formData.phone : formData.whatsappNumber
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[1-9][\d\s\-()]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.isWhatsappSameAsPhone && !formData.whatsappNumber?.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!formData.isWhatsappSameAsPhone && !/^[+]?[1-9][\d\s\-()]{7,15}$/.test(formData.whatsappNumber.replace(/\s/g, ''))) {
      newErrors.whatsappNumber = "Please enter a valid WhatsApp number";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.experience?.trim()) {
      newErrors.experience = "Experience description is required";
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Please select your experience level";
    }

    if (!formData.maxQualification?.trim()) {
      newErrors.maxQualification = "Maximum qualification is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Freelancer Details
        </CardTitle>
        <CardDescription>
          Tell us about your professional background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="required">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 1234567890"
              value={formData.phone}
              onChange={(e) => {
                onChange({ phone: e.target.value });
                if (formData.isWhatsappSameAsPhone) {
                  onChange({ whatsappNumber: e.target.value });
                }
              }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* WhatsApp Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isWhatsappSameAsPhone"
              checked={formData.isWhatsappSameAsPhone}
              onCheckedChange={handleWhatsappCheckboxChange}
            />
            <Label
              htmlFor="isWhatsappSameAsPhone"
              className="text-sm font-normal cursor-pointer"
            >
              This phone number is my WhatsApp number
            </Label>
          </div>

          {/* WhatsApp Number */}
          {!formData.isWhatsappSameAsPhone && (
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="required">
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+91 1234567890"
                value={formData.whatsappNumber}
                onChange={(e) => onChange({ whatsappNumber: e.target.value })}
                className={errors.whatsappNumber ? "border-red-500" : ""}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-500">{errors.whatsappNumber}</p>
              )}
            </div>
          )}

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="required">
              Your Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter your full address"
              value={formData.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="required">
              Experience in your field
            </Label>
            <Textarea
              id="experience"
              placeholder="Describe your professional experience..."
              value={formData.experience}
              onChange={(e) => onChange({ experience: e.target.value })}
              className={errors.experience ? "border-red-500" : ""}
              rows={4}
            />
            {errors.experience && (
              <p className="text-sm text-red-500">{errors.experience}</p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel" className="required">
              Select your experience level
            </Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => onChange({ experienceLevel: value as "beginner" | "intermediate" | "expert" })}
            >
              <SelectTrigger className={errors.experienceLevel ? "border-red-500" : ""}>
                <SelectValue placeholder="Choose experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
            {errors.experienceLevel && (
              <p className="text-sm text-red-500">{errors.experienceLevel}</p>
            )}
          </div>

          {/* Maximum Qualification */}
          <div className="space-y-2">
            <Label htmlFor="maxQualification" className="required">
              Maximum Qualifications
            </Label>
            <Input
              id="maxQualification"
              placeholder="e.g., Bachelor's in Computer Science"
              value={formData.maxQualification}
              onChange={(e) => onChange({ maxQualification: e.target.value })}
              className={errors.maxQualification ? "border-red-500" : ""}
            />
            {errors.maxQualification && (
              <p className="text-sm text-red-500">{errors.maxQualification}</p>
            )}
          </div>

          {/* School Board */}
          <div className="space-y-2">
            <Label htmlFor="schoolBoard">
              School Board
            </Label>
            <Input
              id="schoolBoard"
              placeholder="e.g., CBSE, ICSE, State Board"
              value={formData.schoolBoard}
              onChange={(e) => onChange({ schoolBoard: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Select the board you completed school from
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
