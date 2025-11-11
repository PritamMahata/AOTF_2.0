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
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { PermissionGuard } from "@/components/admin/permission-guard";

export default function AdminEditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId as string;

  console.log('📝 AdminEditPostPage mounted');
  console.log('📝 postId from params:', postId);
  console.log('📝 params object:', params);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [postSubject, setPostSubject] = useState("");
  const [postClassName, setPostClassName] = useState("");
  const [postBoard, setPostBoard] = useState("");
  const [postPreferredTime, setPostPreferredTime] = useState("");
  const [postPreferredTimePeriod, setPostPreferredTimePeriod] = useState("PM");
  const [postPreferredDays, setPostPreferredDays] = useState<string[]>([]);
  const [postFrequency, setPostFrequency] = useState("once");
  const [postClassType, setPostClassType] = useState("online");
  const [postLocation, setPostLocation] = useState("");
  const [postBudget, setPostBudget] = useState("");
  const [postNotes, setPostNotes] = useState("");

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const fetchPostData = useCallback(async () => {
    console.log('🔍 fetchPostData called with postId:', postId);
    try {
      const apiUrl = `/api/posts/${postId}`;
      console.log('🔍 Fetching from:', apiUrl);
      const res = await fetch(apiUrl);
      const data = await res.json();
      console.log('🔍 API response:', { ok: res.ok, status: res.status, data });
      if (res.ok && data.success && data.post) {
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
        toast({
          title: "❌ Error",
          description: "Post not found",
          variant: "destructive",
        });
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load post",
        variant: "destructive",
      });
      router.push("/admin/posts");
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  }, [postId, fetchPostData]);

  const togglePreferredDay = (day: string) => {
    setPostPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!postSubject.trim() || !postClassName || !postBoard || !postFrequency || !postClassType) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const preferredTimeFormatted = postPreferredTime
        ? `${postPreferredTime} ${postPreferredTimePeriod}`
        : "";

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: postSubject.trim(),
          className: postClassName,
          board: postBoard,
          preferredTime: preferredTimeFormatted,
          preferredDays: postPreferredDays,
          frequencyPerWeek: postFrequency,
          classType: postClassType,
          location: postLocation.trim(),
          monthlyBudget: postBudget ? Number(postBudget) : undefined,
          notes: postNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "✅ Success!",
          description: "Post has been updated successfully.",
          duration: 4000,
        });
        // Small delay to let user see the success message before redirect
        setTimeout(() => {
          router.push("/admin/posts");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="posts">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Edit Post (Admin)</CardTitle>
              </div>
              <CardDescription>
                Update post details. Changes will be tracked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Physics"
                  value={postSubject}
                  onChange={(e) => setPostSubject(e.target.value)}
                />
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label htmlFor="className">
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select value={postClassName} onValueChange={setPostClassName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Class {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Board */}
              <div className="space-y-2">
                <Label htmlFor="board">
                  Board <span className="text-red-500">*</span>
                </Label>
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
              </div>

              {/* Preferred Time */}
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={postPreferredTime}
                    onChange={(e) => setPostPreferredTime(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={postPreferredTimePeriod}
                    onValueChange={setPostPreferredTimePeriod}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preferred Days */}
              <div className="space-y-2">
                <Label>Preferred Days</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={postPreferredDays.includes(day)}
                        onCheckedChange={() => togglePreferredDay(day)}
                      />
                      <Label
                        htmlFor={`day-${day}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">
                  Frequency Per Week <span className="text-red-500">*</span>
                </Label>
                <Select value={postFrequency} onValueChange={setPostFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="twice">Twice</SelectItem>
                    <SelectItem value="thrice">Thrice</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Type */}
              <div className="space-y-2">
                <Label htmlFor="classType">
                  Class Type <span className="text-red-500">*</span>
                </Label>
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location (for in-person classes)"
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                />
              </div>

              {/* Monthly Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter monthly budget"
                  value={postBudget}
                  onChange={(e) => setPostBudget(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific requirements or preferences..."
                  rows={4}
                  value={postNotes}
                  onChange={(e) => setPostNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Post"
                  )}
                </Button>
                <Link href="/admin/posts" className="flex-1">
                  <Button variant="outline" className="w-full" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
