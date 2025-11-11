"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Badge } from "@aotf/ui/components/badge";
import {
  Clock,
  MapPin,
  User,
  Send,
  Share,
  Download,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Link as LinkIcon,
  ExternalLink,
  Users,
  CheckCircle,
  PauseCircle,
  UserCheck,
} from "lucide-react";
import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import Link from "next/link";
import { toast } from "sonner";
import { PostEditMarker } from "./post-edit-marker";

interface Application {
  _id: string;
  status: "pending" | "approved" | "declined" | "completed";
  appliedAt: Date;
  teacher: {
    teacherId?: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    experience?: string;
    rating?: number;
    avatar?: string;
  };
  postId: string;
}

interface GuardianPost {
  id: number | string;
  postId?: string;
  userId?: string;
  guardian: string;
  guardianId?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianLocation?: string;
  guardianWhatsapp?: string;
  subject: string;
  class: string;
  board: string;
  location?: string;
  budget: string;
  monthlyBudget?: number;
  genderPreference: string;
  description: string;
  postedDate: string;
  applicants: number;
  status: string;
  classType?: string;
  frequency?: string;
  preferredTime?: string;
  preferredDays?: string[];
  isOwner?: boolean;
  applications?: Application[];
  hasApplied?: boolean;
  hasApprovedTeacher?: boolean;
  editedBy?: "guardian" | "admin" | "teacher";
  editedAt?: Date | string;
  editedByUserId?: string;
  editedByName?: string;
}

interface GuardianPostCardProps {
  post: GuardianPost;
  onApply: (postId: number | string) => void;
  canApply?: boolean;
  showFullDetails?: boolean;
  hideActionButtons?: boolean; // Hide copy/share/edit buttons
  currentUserId?: string; // Current logged-in user's ID
}

export function GuardianPostCard({
  post,
  onApply,
  canApply = true,
  showFullDetails = false,
  hideActionButtons = false,
  currentUserId,
}: GuardianPostCardProps) {
  const captureRef = useRef<HTMLDivElement>(null);

  const getPostUrl = () => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      return `${baseUrl}/feed/${post.postId || post.id}`;
    }
    return "";
  };

  const copyPostLink = async () => {
    const url = getPostUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!", {
        description: "You can now share this post link with others.",
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link", {
        description: "Please try again.",
      });
    }
  };

  const sharePost = async () => {
    const shareTitle = `🎓 Teaching Opportunity - ${post.subject} (${post.class})`;

    let shareText = `📚 Subject: ${post.subject}
👨‍🎓 Class: ${post.class} (${post.board})
💰 Budget: ${post.budget}`;

    if (post.classType) {
      shareText += `\n📖 Class Type: ${post.classType}`;
    }

    if (post.frequency) {
      shareText += `\n📅 Frequency: ${post.frequency}/week`;
    }

    if (post.preferredTime) {
      shareText += `\n⏰ Preferred Time: ${post.preferredTime}`;
    }

    if (post.preferredDays && post.preferredDays.length > 0) {
      shareText += `\n📆 Preferred Days: ${post.preferredDays.join(", ")}`;
    }

    shareText += `\n\n📝 Requirements:\n${post.description}\n`;

    if (post.guardianLocation || post.guardianEmail || post.guardianPhone) {
      shareText += `\n👤 Guardian Contact:`;
      if (post.guardian) shareText += `\n   Name: ${post.guardian}`;
      if (post.guardianLocation)
        shareText += `\n   📍 Location: ${post.guardianLocation}`;
      if (post.guardianEmail)
        shareText += `\n   � Email: ${post.guardianEmail}`;
      if (post.guardianPhone)
        shareText += `\n   📞 Phone: ${post.guardianPhone}`;
    }

    shareText += `\n\n📅 Posted: ${post.postedDate}
📊 Applicants: ${post.applicants}

🔗 View full post: ${getPostUrl()}`;

    // Check if we're on a mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    try {
      // First priority: Try Web Share API (opens native share sheet)
      if ("share" in navigator) {
        const textShareData = {
          title: shareTitle,
          text: shareText,
        };

        if (!("canShare" in navigator) || navigator.canShare(textShareData)) {
          await navigator.share(textShareData);
          return; // Success!
        }
      }

      // Fallback for browsers without Web Share API
      if (isMobile) {
        // On mobile, open WhatsApp with formatted text
        const encodedText = encodeURIComponent(shareText);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, "_blank");
      } else {
        // Desktop: copy formatted text to clipboard
        await navigator.clipboard.writeText(shareText);
        alert("📋 Formatted text copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      // Final fallback: copy formatted text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert("📋 Text copied to clipboard!");
      } catch (clipboardErr) {
        console.error("Failed to copy to clipboard:", clipboardErr);
        alert(`📋 Share this post:\n\n${shareText}`);
      }
    }
  };

  const downloadCardImage = async () => {
    if (!captureRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        quality: 1,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // Higher quality
      });

      const link = document.createElement("a");
      link.download = `teaching_opportunity_${post.guardian.replace(
        /\s+/g,
        "_"
      )}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download card image:", err);
      alert("Failed to download image. Please try again.");
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" ref={captureRef}>
      <CardHeader>
        {/* Post ID Banner */}
        <div className="bg-muted/50 border border-border rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Post ID:
            </span>
            <span className="text-xs font-mono bg-background px-2 py-1 rounded border border-border">
              {post.postId || post.id}
            </span>
          </div>
        </div>

        {/* Teacher Assigned Banner */}
        {post.hasApprovedTeacher && (
          <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-md p-3 mt-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
              <div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Teacher Assigned
                </span>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  This position has been filled
                </p>
              </div>
            </div>
          </div>
        )}

        {/* On Hold Banner */}
        {post.status === "hold" && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-md p-3 mt-2">
            <div className="flex items-center gap-2">
              <PauseCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  This post is currently on hold
                </span>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">
                  Applications are temporarily paused for this opportunity
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-lg">{post.guardian}</CardTitle>
                {post.guardianId && (
                  <p className="text-xs text-muted-foreground">
                    ID: {post.guardianId}
                  </p>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.postedDate}
                </div>
                {/* Edit Marker */}
                <PostEditMarker
                  editedBy={post.editedBy}
                  editedAt={post.editedAt}
                  editedByName={post.editedByName}
                  editedByUserId={post.editedByUserId}
                  currentUserId={currentUserId}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{post.subject || "N/A"}</Badge>
              <Badge variant="outline">{post.class || "N/A"}</Badge>
              <Badge variant="outline">{post.board || "N/A"}</Badge>
              <Badge variant="outline" className="capitalize">
                {post.classType || "N/A"}
              </Badge>
              {post.hasApprovedTeacher && (
                <Badge
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Teacher Assigned
                </Badge>
              )}
              {post.status === "hold" && (
                <Badge
                  variant="destructive"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <PauseCircle className="h-3 w-3 mr-1" />
                  On Hold
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {post.budget}
            </div>
            <div className="text-sm text-muted-foreground">
              {post.applicants} applicants
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Guardian Contact Details */}
          {(post.guardianEmail ||
            post.guardianPhone ||
            post.guardianLocation) && (
            <div className="bg-muted/50 rounded-lg space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Place</h4>
              <div className="grid gap-2 text-sm">
                {post.guardianEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="break-all">{post.guardianEmail}</span>
                  </div>
                )}
                {post.guardianPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{post.guardianPhone}</span>
                  </div>
                )}
                {post.guardianLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{post.guardianLocation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post Description */}
          {post.description && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Requirements
              </h4>
              <p className="text-sm text-muted-foreground">
                {post.description}
              </p>
            </div>
          )}

          {/* Class Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {post.frequency && (
              <div className="flex items-start gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Frequency</p>
                  <p className="text-muted-foreground capitalize">
                    {post.frequency}/week
                  </p>
                </div>
              </div>
            )}
            {post.preferredTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Preferred Time</p>
                  <p className="text-muted-foreground">{post.preferredTime}</p>
                </div>
              </div>
            )}
            {post.classType && (
              <div className="flex items-start gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Class Type</p>
                  <p className="text-muted-foreground capitalize">
                    {post.classType}
                  </p>
                </div>
              </div>
            )}
            {post.preferredDays && post.preferredDays.length > 0 && (
              <div className="flex items-start gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Preferred Days</p>
                  <p className="text-muted-foreground">
                    {post.preferredDays.join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Applications Section - Only visible to post owner */}
          {post.isOwner &&
            post.applications &&
            post.applications.length > 0 && (
              <div className="border rounded-lg p-3 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Applications: {post.applications.length}
                  </h4>
                </div>
              </div>
            )}

          {/* Action Buttons */}
          {!hideActionButtons && (
            <div className="space-y-2 pt-2">
              {!showFullDetails && (
                <Link
                  href={`/feed/${post.postId || post.id}` as any}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Post
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2">
                {/* Apply Button */}
                <Button
                  onClick={() => {
                    if (
                      canApply &&
                      !post.hasApplied &&
                      post.status !== "hold" &&
                      !post.hasApprovedTeacher
                    )
                      onApply(post.id);
                  }}
                  className="flex-1"
                  disabled={
                    !canApply ||
                    post.hasApplied ||
                    post.status === "hold" ||
                    post.hasApprovedTeacher
                  }
                  variant={
                    post.hasApprovedTeacher
                      ? "outline"
                      : post.hasApplied
                      ? "secondary"
                      : post.status === "hold"
                      ? "outline"
                      : "default"
                  }
                >
                  {post.hasApprovedTeacher ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Teacher Assigned
                    </>
                  ) : post.status === "hold" ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      On Hold
                    </>
                  ) : post.hasApplied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>

                {/* Share and utility buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPostLink}
                  title="Copy post link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCardImage}
                  title="Download as image"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePost}
                  title="Share post"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default GuardianPostCard;
