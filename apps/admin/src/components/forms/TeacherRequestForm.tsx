"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Textarea } from "@aotf/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { validateTeacherRequestForm } from "@aotf/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@aotf/ui/components/separator";
import { BookOpen, Calendar, MapPin, FileText, Clock, Users } from "lucide-react";

interface TeacherRequestFormProps {
  onSubmit: (data: TeacherRequestData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface TeacherRequestData {
  subject: string;
  className: string;
  board?: string;
  preferredTime?: string;
  preferredDays: string[];
  frequencyPerWeek: string;
  classType: string;
  location?: string;
  monthlyBudget?: number;
  notes: string;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BOARDS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "ISC", label: "ISC" },
  { value: "WBBSE", label: "WBBSE" },
  { value: "WBCHS", label: "WBCHS" },
];

const FREQUENCIES = [
  { value: "once", label: "Once per week", maxDays: 1 },
  { value: "twice", label: "Twice per week", maxDays: 2 },
  { value: "thrice", label: "Thrice per week", maxDays: 3 },
  { value: "custom", label: "Custom", maxDays: 7 },
];

const CLASS_TYPES = [
  { value: "online", label: "Online" },
  { value: "in-person", label: "In-Person" },
  { value: "both", label: "Both Online & In-Person" },
];

export function TeacherRequestForm({ onSubmit, onCancel, isSubmitting = false }: TeacherRequestFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [board, setBoard] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [preferredTimePeriod, setPreferredTimePeriod] = useState("PM");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("once");
  const [classType, setClassType] = useState("online");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  
  // Error state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getMaxDaysAllowed = () => {
    const freq = FREQUENCIES.find(f => f.value === frequency);
    return freq?.maxDays || 7;
  };

  const togglePreferredDay = (day: string) => {
    setPreferredDays((prev) => {
      const maxDays = getMaxDaysAllowed();
      
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      
      if (prev.length >= maxDays) {
        toast({
          title: "⚠️ Maximum Days Reached",
          description: `You can only select up to ${maxDays} day${maxDays > 1 ? 's' : ''} for "${frequency}" frequency.`,
          variant: "destructive",
          duration: 3000,
        });
        return prev;
      }
      
      return [...prev, day];
    });
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    const maxDaysForNewFreq = FREQUENCIES.find(f => f.value === value)?.maxDays || 7;
    
    if (preferredDays.length > maxDaysForNewFreq && value !== "custom") {
      setPreferredDays(preferredDays.slice(0, maxDaysForNewFreq));
      toast({
        title: "ℹ️ Days Adjusted",
        description: `Selected days reduced to ${maxDaysForNewFreq} to match new frequency.`,
        duration: 3000,
      });
    }
  };

  const resetForm = () => {
    setSubject("");
    setClassName("");
    setBoard("");
    setPreferredTime("");
    setPreferredTimePeriod("PM");
    setPreferredDays([]);
    setFrequency("once");
    setClassType("online");
    setLocation("");
    setBudget("");
    setNotes("");
    setValidationErrors([]);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setValidationErrors([]);

    const combinedTime = preferredTime.trim() 
      ? `${preferredTime.trim()} ${preferredTimePeriod}`
      : '';

    const validation = validateTeacherRequestForm({
      subject,
      className,
      board,
      preferredTime,
      preferredDays,
      frequencyPerWeek: frequency,
      classType,
      location,
      monthlyBudget: budget,
      notes,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSubmitError('Please fix the validation errors below');
      toast({
        title: "❌ Validation Error",
        description: validation.errors[0] || "Please check all required fields",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      await onSubmit({
        subject: subject.trim(),
        className: className.trim(),
        board: board || undefined,
        preferredTime: combinedTime || undefined,
        preferredDays,
        frequencyPerWeek: frequency,
        classType,
        location: location.trim() || "",
        monthlyBudget: budget ? Number(budget) : 0,
        notes: notes.trim(),
      });
      resetForm();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const requiresLocation = classType !== "online";

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">
          Create a Teacher Request
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Fill in the details to find the perfect teacher for your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Messages */}
        {submitError && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold">{submitError}</p>
          </div>
        )}
        {validationErrors.length > 0 && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg space-y-2">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Basic Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground flex items-center gap-1">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, English"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class" className="text-foreground flex items-center gap-1">
                Class/Grade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Grade 10, Class 12"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Board</Label>
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-foreground">
                Estimated Monthly Payment (₹)
              </Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 3000"
                className="bg-input border-border"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4" />
            <span>Schedule Preferences</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Class Type
              </Label>
              <Select value={classType} onValueChange={setClassType}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Frequency per Week</Label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Preferred Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g., 6-7"
                  className="bg-input border-border flex-1"
                />
                <Select value={preferredTimePeriod} onValueChange={setPreferredTimePeriod}>
                  <SelectTrigger className="bg-input border-border w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-foreground">Preferred Days</Label>
            <p className="text-xs text-muted-foreground">
              {frequency === "custom" 
                ? "Select any days for custom frequency"
                : `Select up to ${getMaxDaysAllowed()} day${getMaxDaysAllowed() > 1 ? 's' : ''} (${preferredDays.length}/${getMaxDaysAllowed()} selected)`
              }
            </p>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <label
                  key={day}
                  className={`flex items-center gap-2 text-sm cursor-pointer select-none border rounded-lg px-4 py-2.5 transition-all ${
                    preferredDays.includes(day)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <Checkbox
                    checked={preferredDays.includes(day)}
                    onCheckedChange={() => togglePreferredDay(day)}
                    className="data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Location Section - Only show if needed */}
        {requiresLocation && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground flex items-center gap-1">
                  Preferred Location <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your preferred location"
                    className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Required for in-person classes
                </p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Additional Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4" />
            <span>Additional Details</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Additional Requirements or Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share any specific requirements, topics to focus on, teaching style preferences, or other relevant information..."
              className="bg-input border-border min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help teachers understand your specific needs better
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {isSubmitting ? "Posting..." : "Post Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
