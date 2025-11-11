"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Textarea } from "@aotf/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select";
import { Badge } from "@aotf/ui/components/badge";
import { useToast } from "@aotf/ui/hooks/use-toast";
import { Separator } from "@aotf/ui/components/separator";
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  FileText, 
  Tag, 
  Users, 
  Clock,
  MapPin,
  Languages,
  Target,
  X
} from "lucide-react";

interface ClientProjectFormProps {
  onSubmit: (data: ClientProjectData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface ClientProjectData {
  projectTitle: string;
  category: string;
  subcategory: string;
  projectType: string;
  description: string;
  budgetType: string;
  budgetAmount?: number;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
  expectedHours?: number;
  startDate?: string;
  deadline?: string;
  duration?: string;
  urgency: string;
  requiredSkills: string[];
  experienceLevel: string;
  freelancerType: string;
  preferredLocation?: string;
  languageRequirements: string[];
}

const CATEGORIES = [
  { 
    value: "web-development", 
    label: "Web Development",
    subcategories: ["Frontend", "Backend", "Full Stack", "WordPress", "E-commerce", "CMS"]
  },
  { 
    value: "mobile-development", 
    label: "Mobile Development",
    subcategories: ["iOS", "Android", "React Native", "Flutter", "Hybrid Apps"]
  },
  { 
    value: "design", 
    label: "Design & Creative",
    subcategories: ["UI/UX", "Graphic Design", "Logo Design", "Branding", "Illustration", "Video Editing"]
  },
  { 
    value: "marketing", 
    label: "Marketing & Sales",
    subcategories: ["Digital Marketing", "SEO", "Social Media", "Content Marketing", "Email Marketing", "PPC"]
  },
  { 
    value: "writing", 
    label: "Writing & Content",
    subcategories: ["Content Writing", "Copywriting", "Technical Writing", "Blog Writing", "Translation"]
  },
  { 
    value: "data-science", 
    label: "Data Science & Analytics",
    subcategories: ["Data Analysis", "Machine Learning", "AI", "Data Visualization", "Business Intelligence"]
  },
  { 
    value: "consulting", 
    label: "Business & Consulting",
    subcategories: ["Business Strategy", "Financial Consulting", "HR Consulting", "Legal Consulting"]
  },
  { 
    value: "other", 
    label: "Other",
    subcategories: ["General", "Miscellaneous"]
  }
];

const PROJECT_TYPES = [
  { value: "one-time", label: "One-time Project" },
  { value: "ongoing", label: "Ongoing Collaboration" },
  { value: "consultation", label: "Consultation" }
];

const BUDGET_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" }
];

const URGENCY_LEVELS = [
  { value: "flexible", label: "Flexible - No rush" },
  { value: "normal", label: "Normal - Standard timeline" },
  { value: "urgent", label: "Urgent - Quick turnaround needed" }
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner - New to the field" },
  { value: "intermediate", label: "Intermediate - Some experience" },
  { value: "expert", label: "Expert - Highly experienced" }
];

const FREELANCER_TYPES = [
  { value: "individual", label: "Individual Freelancer" },
  { value: "team", label: "Team of Freelancers" },
  { value: "agency", label: "Agency" }
];

const COMMON_SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", "Vue.js", "Angular",
  "PHP", "Java", "C++", "Ruby", "Go", "Swift", "Kotlin",
  "HTML/CSS", "Tailwind CSS", "Bootstrap", "Material-UI",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Azure", "GCP",
  "Docker", "Kubernetes", "CI/CD", "Git",
  "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "SEO", "Google Analytics", "Social Media Marketing",
  "Content Writing", "Copywriting", "Technical Writing"
];

const LANGUAGES = [
  "English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", 
  "Kannada", "Malayalam", "Punjabi", "Urdu", "Odia", "Spanish", "French", "German", "Chinese", "Japanese"
];

export function ClientProjectForm({ onSubmit, onCancel, isSubmitting = false }: ClientProjectFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [projectTitle, setProjectTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [projectType, setProjectType] = useState("one-time");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetRangeMin, setBudgetRangeMin] = useState("");
  const [budgetRangeMax, setBudgetRangeMax] = useState("");
  const [expectedHours, setExpectedHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [freelancerType, setFreelancerType] = useState("individual");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [languageRequirements, setLanguageRequirements] = useState<string[]>(["English"]);
  
  // Error state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getSubcategories = () => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.subcategories || [];
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  const addSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  const toggleLanguage = (language: string) => {
    if (languageRequirements.includes(language)) {
      setLanguageRequirements(languageRequirements.filter(l => l !== language));
    } else {
      setLanguageRequirements([...languageRequirements, language]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!projectTitle.trim()) errors.push("Project title is required");
    if (!category) errors.push("Category is required");
    if (!subcategory) errors.push("Subcategory is required");
    if (!description.trim() || description.trim().length < 50) {
      errors.push("Description must be at least 50 characters");
    }
    if (budgetType === "fixed" && !budgetAmount) {
      errors.push("Budget amount is required for fixed price projects");
    }
    if (budgetType === "hourly") {
      if (!budgetRangeMin || !budgetRangeMax) {
        errors.push("Budget range is required for hourly projects");
      }
      if (!expectedHours) {
        errors.push("Expected hours are required for hourly projects");
      }
    }
    if (requiredSkills.length === 0) {
      errors.push("At least one skill is required");
    }
    if (languageRequirements.length === 0) {
      errors.push("At least one language requirement is needed");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const resetForm = () => {
    setProjectTitle("");
    setCategory("");
    setSubcategory("");
    setProjectType("one-time");
    setDescription("");
    setBudgetType("fixed");
    setBudgetAmount("");
    setBudgetRangeMin("");
    setBudgetRangeMax("");
    setExpectedHours("");
    setStartDate("");
    setDeadline("");
    setDuration("");
    setUrgency("normal");
    setRequiredSkills([]);
    setCustomSkill("");
    setExperienceLevel("intermediate");
    setFreelancerType("individual");
    setPreferredLocation("");
    setLanguageRequirements(["English"]);
    setValidationErrors([]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "❌ Validation Error",
        description: validationErrors[0] || "Please check all required fields",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      await onSubmit({
        projectTitle: projectTitle.trim(),
        category,
        subcategory,
        projectType,
        description: description.trim(),
        budgetType,
        budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
        budgetRangeMin: budgetRangeMin ? Number(budgetRangeMin) : undefined,
        budgetRangeMax: budgetRangeMax ? Number(budgetRangeMax) : undefined,
        expectedHours: expectedHours ? Number(expectedHours) : undefined,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        duration: duration || undefined,
        urgency,
        requiredSkills,
        experienceLevel,
        freelancerType,
        preferredLocation: preferredLocation.trim() || undefined,
        languageRequirements,
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

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">
          Post a New Project
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Fill in the details to find the perfect freelancer for your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Messages */}
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

        {/* Project Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-4 w-4" />
            <span>Project Information</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle" className="text-foreground flex items-center gap-1">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., E-commerce Website Development"
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  Subcategory <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={subcategory} 
                  onValueChange={setSubcategory}
                  disabled={!category}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubcategories().map((sub) => (
                      <SelectItem key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  Project Type <span className="text-red-500">*</span>
                </Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Urgency <span className="text-red-500">*</span>
                </Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((ul) => (
                      <SelectItem key={ul.value} value={ul.value}>
                        {ul.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Project Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your project, including goals, expectations, deliverables, and any specific requirements..."
                className="bg-input border-border min-h-[150px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters • {description.length} characters
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Budget Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Budget & Payment</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-1">
                Budget Type <span className="text-red-500">*</span>
              </Label>
              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map((bt) => (
                    <SelectItem key={bt.value} value={bt.value}>
                      {bt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {budgetType === "fixed" ? (
              <div className="space-y-2">
                <Label htmlFor="budgetAmount" className="text-foreground flex items-center gap-1">
                  Budget Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g., 50000"
                  className="bg-input border-border"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetRangeMin" className="text-foreground flex items-center gap-1">
                    Hourly Rate - Min (₹/hour) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="budgetRangeMin"
                    type="number"
                    value={budgetRangeMin}
                    onChange={(e) => setBudgetRangeMin(e.target.value)}
                    placeholder="e.g., 500"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetRangeMax" className="text-foreground flex items-center gap-1">
                    Hourly Rate - Max (₹/hour) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="budgetRangeMax"
                    type="number"
                    value={budgetRangeMax}
                    onChange={(e) => setBudgetRangeMax(e.target.value)}
                    placeholder="e.g., 1500"
                    className="bg-input border-border"
                  />
                </div>
              </div>
            )}

            {budgetType === "hourly" && (
              <div className="space-y-2">
                <Label htmlFor="expectedHours" className="text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Expected Hours <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expectedHours"
                  type="number"
                  value={expectedHours}
                  onChange={(e) => setExpectedHours(e.target.value)}
                  placeholder="e.g., 40"
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated total hours needed for the project
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Timeline Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4" />
            <span>Timeline & Schedule</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-foreground">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="duration" className="text-foreground">
                Project Duration
              </Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2 weeks, 1 month, 3 months"
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Estimated time to complete the project
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Skills & Requirements Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4" />
            <span>Skills & Requirements</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-1">
                Required Skills <span className="text-red-500">*</span>
              </Label>
              
              {/* Selected Skills */}
              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  {requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X className="h-3 w-3 ml-2" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Common Skills */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Popular skills:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.filter(s => !requiredSkills.includes(s)).slice(0, 15).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  placeholder="Add custom skill"
                  className="bg-input border-border flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomSkill}
                  disabled={!customSkill.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  Experience Level <span className="text-red-500">*</span>
                </Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((el) => (
                      <SelectItem key={el.value} value={el.value}>
                        {el.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Freelancer Type <span className="text-red-500">*</span>
                </Label>
                <Select value={freelancerType} onValueChange={setFreelancerType}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select freelancer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREELANCER_TYPES.map((ft) => (
                      <SelectItem key={ft.value} value={ft.value}>
                        {ft.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLocation" className="text-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Preferred Location <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                </div>
              </Label>
              <Input
                id="preferredLocation"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g., Kolkata, Remote, India"
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if location doesn't matter
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-1">
                <Languages className="h-3.5 w-3.5" />
                Language Requirements <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Select languages the freelancer should be proficient in
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang}
                    variant={languageRequirements.includes(lang) ? "default" : "outline"}
                    className="px-3 py-1.5 text-sm cursor-pointer transition-colors"
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
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
            {isSubmitting ? "Posting Project..." : "Post Project"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
