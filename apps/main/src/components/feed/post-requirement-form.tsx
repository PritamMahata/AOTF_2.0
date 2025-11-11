"use client";

import { useState } from "react";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select";

interface PostRequirementFormData {
  subject: string;
  class: string;
  board: string;
  location: string;
  budget: string;
  genderPreference: string;
  description: string;
}

interface PostRequirementFormProps {
  onSubmit: (data: PostRequirementFormData) => void;
}

export function PostRequirementForm({ onSubmit }: PostRequirementFormProps) {
  const [formData, setFormData] = useState<PostRequirementFormData>({
    subject: "Mathematics",
    class: "Class 10",
    board: "CBSE",
    location: "",
    budget: "",
    genderPreference: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (key: keyof PostRequirementFormData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleInputChange("subject", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Class *</Label>
          <Select
            value={formData.class}
            onValueChange={(value) => handleInputChange("class", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class 1">Class 1</SelectItem>
              <SelectItem value="Class 2">Class 2</SelectItem>
              <SelectItem value="Class 3">Class 3</SelectItem>
              <SelectItem value="Class 4">Class 4</SelectItem>
              <SelectItem value="Class 5">Class 5</SelectItem>
              <SelectItem value="Class 6">Class 6</SelectItem>
              <SelectItem value="Class 7">Class 7</SelectItem>
              <SelectItem value="Class 8">Class 8</SelectItem>
              <SelectItem value="Class 9">Class 9</SelectItem>
              <SelectItem value="Class 10">Class 10</SelectItem>
              <SelectItem value="Class 11">Class 11</SelectItem>
              <SelectItem value="Class 12">Class 12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="board">Board *</Label>
          <Select
            value={formData.board}
            onValueChange={(value) => handleInputChange("board", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBSE">CBSE</SelectItem>
              <SelectItem value="ICSE">ICSE</SelectItem>
              <SelectItem value="ISC">ISC</SelectItem>
              <SelectItem value="WBBSE">WBBSE</SelectItem>
              <SelectItem value="WBCHS">WBCHS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget *</Label>
          <Input
            id="budget"
            placeholder="e.g., ₹500/hour"
            value={formData.budget}
            onChange={(e) => handleInputChange("budget", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="Enter your location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Gender Preference</Label>
        <Select
          value={formData.genderPreference}
          onValueChange={(value) => handleInputChange("genderPreference", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="No preference">No preference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <textarea
          id="description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe your learning requirements..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Post Teaching Opportunity
      </Button>
    </form>
  );
} 