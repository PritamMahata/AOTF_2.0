import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Textarea } from "@aotf/ui/components/textarea";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface ClientFormData {
  phone: string;
  whatsappNumber: string;
  companyName: string;
  companyWebsite: string;
  address: string;
  industry: string;
}

interface ClientDetailsFormProps {
  formData: ClientFormData;
  onChange: (data: Partial<ClientFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ClientDetailsForm({ 
  formData, 
  onChange, 
  onNext, 
  onBack,
  isLoading = false 
}: ClientDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[1-9][\d\s\-()]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.industry?.trim()) {
      newErrors.industry = "Industry is required";
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
          Client Details
        </CardTitle>
        <CardDescription>
          Tell us about your company and requirements
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
              onChange={(e) => onChange({ phone: e.target.value })}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              WhatsApp Number
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="+91 1234567890 (optional)"
              value={formData.whatsappNumber}
              onChange={(e) => onChange({ whatsappNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if same as phone number
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="required">
              Company Name
            </Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* Company Website */}
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">
              Company Website
            </Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://www.example.com (optional)"
              value={formData.companyWebsite}
              onChange={(e) => onChange({ companyWebsite: e.target.value })}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="required">
              Company Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter your company address"
              value={formData.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="required">
              Industry
            </Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) => onChange({ industry: e.target.value })}
              className={errors.industry ? "border-red-500" : ""}
            />
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry}</p>
            )}
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
