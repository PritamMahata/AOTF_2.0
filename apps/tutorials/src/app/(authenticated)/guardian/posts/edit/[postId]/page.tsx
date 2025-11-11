"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Textarea } from "@aotf/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@aotf/ui/hooks/use-toast";
import Link from "next/link";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [, setGuardianName] = useState<string>("");
  const [, setGuardianAvatar] = useState<string>("");

  // Form fields
  const [postSubject, setPostSubject] = useState("");
  const [postClassName, setPostClassName] = useState("");
  const [postBoard, setPostBoard] = useState("");  const [postPreferredTime, setPostPreferredTime] = useState("");
  const [postPreferredTimePeriod, setPostPreferredTimePeriod] = useState("PM");
  const [postPreferredDays, setPostPreferredDays] = useState<string[]>([]);
  const [postFrequency, setPostFrequency] = useState("once");
  const [postClassType, setPostClassType] = useState("online");
  const [postLocation, setPostLocation] = useState("");
  const [postBudget, setPostBudget] = useState("");
  const [postNotes, setPostNotes] = useState("");

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const fetchPostData = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();      if (res.ok && data.success && data.post) {
        const post = data.post;
        setPostSubject(post.subject || "");
        setPostClassName(post.class || "");
        setPostBoard(post.board || "");
        
        // Parse preferred time to extract time and period (AM/PM)
        const preferredTime = post.preferredTime || "";
        if (preferredTime) {
          const timeParts = preferredTime.match(/^(.+?)\s*(AM|PM)$/i);
          if (timeParts) {
            setPostPreferredTime(timeParts[1].trim());
            setPostPreferredTimePeriod(timeParts[2].toUpperCase());
          } else {
            setPostPreferredTime(preferredTime);
          }
        }
        
        setPostPreferredDays(post.preferredDays || []);
        setPostFrequency(post.frequency || "once");
        setPostClassType(post.classType || "online");
        setPostLocation(post.location || "");
        setPostBudget(post.monthlyBudget?.toString() || "");
        setPostNotes(post.description || "");
      } else {
        router.push("/guardian");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push("/guardian");
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    fetchGuardianProfile();
    if (postId) {
      fetchPostData();
    }
  }, [postId, fetchPostData]);

  const fetchGuardianProfile = async () => {
    try {
      const res = await fetch("/api/guardian/profile");
      const data = await res.json();
      if (res.ok && data.success && data.guardian) {
        setGuardianName(data.guardian.name || "Guardian");
        setGuardianAvatar(data.guardian.avatar || "");
      }
    } catch (error) {
      console.error("Error fetching guardian profile:", error);
    }
  };

  const togglePreferredDay = (day: string) => {
    setPostPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postSubject.trim() || !postClassName.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and Class are required",
        variant: "destructive",
      });
      return;
    }

    if (postClassType !== "online" && !postLocation.trim()) {
      toast({
        title: "Validation Error",
        description: "Location is required for in-person classes",
        variant: "destructive",
      });
      return;
    }    setSubmitting(true);
    try {
      // Combine time and period for submission
      const combinedPreferredTime = postPreferredTime.trim() 
        ? `${postPreferredTime.trim()} ${postPreferredTimePeriod}` 
        : "";
      
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: postSubject.trim(),
          className: postClassName.trim(),
          board: postBoard || undefined,
          preferredTime: combinedPreferredTime,
          preferredDays: postPreferredDays,
          frequencyPerWeek: postFrequency,
          classType: postClassType,
          location: postLocation.trim() || undefined,
          monthlyBudget: postBudget ? Number(postBudget) : undefined,
          notes: postNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "✅ Success!",
          description: "Your post has been updated successfully.",
          duration: 4000,
        });
        // Small delay to let user see the success message before redirect
        setTimeout(() => {
          router.push("/guardian");
        }, 500);
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to update post",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update post. Please check your connection.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/guardian">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Teacher Request</CardTitle>
            <CardDescription>Update your post details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={postSubject}
                    onChange={(e) => setPostSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">
                    Class/Grade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="class"
                    value={postClassName}
                    onChange={(e) => setPostClassName(e.target.value)}
                    placeholder="e.g., Grade 10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Board</Label>
                  <Select value={postBoard} onValueChange={setPostBoard}>
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
                </div>                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="time"
                      value={postPreferredTime}
                      onChange={(e) => setPostPreferredTime(e.target.value)}
                      placeholder="e.g., 6-7"
                      className="flex-1"
                    />
                    <Select value={postPreferredTimePeriod} onValueChange={setPostPreferredTimePeriod}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Preferred Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 text-sm cursor-pointer border rounded-md px-3 py-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={postPreferredDays.includes(day)}
                          onCheckedChange={() => togglePreferredDay(day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Frequency per Week</Label>
                  <Select value={postFrequency} onValueChange={setPostFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once per week</SelectItem>
                      <SelectItem value="twice">Twice per week</SelectItem>
                      <SelectItem value="thrice">Thrice per week</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class Type</Label>
                  <Select value={postClassType} onValueChange={setPostClassType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {postClassType !== "online" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">
                      Location {postClassType !== "online" && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="location"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      placeholder="Enter location"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={postBudget}
                    onChange={(e) => setPostBudget(e.target.value)}
                    placeholder="e.g., 2000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Additional Requirements</Label>
                  <Textarea
                    id="notes"
                    value={postNotes}
                    onChange={(e) => setPostNotes(e.target.value)}
                    placeholder="Any specific requirements or preferences..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Post"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/guardian")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
