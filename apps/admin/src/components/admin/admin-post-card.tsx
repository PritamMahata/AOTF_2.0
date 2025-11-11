"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Badge } from "@aotf/ui/components/badge";
import {
  Clock,
  MapPin,
  User,
  Share,
  Download,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Link as LinkIcon,
  ExternalLink,
  PauseCircle,
  Edit,
} from "lucide-react";
import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import { toast } from "@/hooks/use-toast";

interface GuardianPost {
  id: number | string;
  postId?: string;
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
}

interface GuardianPostCardProps {
  post: GuardianPost;
  onApply: (postId: number | string) => void;
  canApply?: boolean;
  showFullDetails?: boolean;
  // Admin actions
  onView?: (post: GuardianPost) => void;
  onHold?: (post: GuardianPost) => void;
  onEdit?: (post: GuardianPost) => void;
  showAdminActions?: boolean;
  holdStatus?: boolean;
}

export function AdminPostCard({
  post,
  onView,
  onHold,
  onEdit,
  showAdminActions = false,
  holdStatus = false,
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
      toast({
        title: "Link Copied!",
        description: "Post link has been copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
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
    <Card
  ref={captureRef}
  className="
    flex flex-col justify-between w-full md:w-fit h-auto
    rounded-2xl border border-border/50 bg-card/80
    hover:shadow-xl hover:-translate-y-[2px]
    transition-all duration-300 ease-in-out
  "
>
  {/* Header */}
  <CardHeader className="pb-3">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      {/* Left: Guardian Info */}
      <div className="space-y-2 w-full sm:w-3/4">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground break-words">
            {post.guardian}
          </CardTitle>
          {post.postId && (
            <p className="text-xs text-muted-foreground break-words">
              ID: {post.postId}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>{post.postedDate}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary">{post.subject}</Badge>
          <Badge variant="outline">{post.class}</Badge>
          <Badge variant="outline">{post.board}</Badge>
          {post.classType && (
            <Badge variant="outline" className="capitalize">
              {post.classType}
            </Badge>
          )}
          {(post.status === 'hold' || holdStatus) && (
            <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <PauseCircle className="h-3 w-3 mr-1" />
              On Hold
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Budget Info */}
      <div className="text-left sm:text-right w-full sm:w-auto">
        <p className="text-lg sm:text-xl font-bold text-primary">
          {post.budget}
        </p>
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {post.applicants} applicants
        </p>
      </div>
    </div>
  </CardHeader>

  {/* Content */}
  <CardContent className="space-y-4">
    {/* On Hold Banner */}
    {(post.status === 'hold' || holdStatus) && (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-md p-3">
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

    {/* Guardian Contact */}
    {(post.guardianEmail || post.guardianPhone || post.guardianLocation) && (
      <div className="bg-muted/40 rounded-xl p-3 space-y-2 border border-border/30">
        <h4 className="text-sm font-semibold text-foreground">
          Place
        </h4>
        <div className="grid gap-2 text-sm break-words">
          {post.guardianEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="break-all">{post.guardianEmail}</span>
            </div>
          )}
          {post.guardianPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{post.guardianPhone}</span>
            </div>
          )}
          {post.guardianLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{post.guardianLocation}</span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Description */}
    {post.description && (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          Requirements
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed break-words">
          {post.description}
        </p>
      </div>
    )}

    {/* Class Details */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {post.frequency && (
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
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
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Preferred Time</p>
            <p className="text-muted-foreground">{post.preferredTime}</p>
          </div>
        </div>
      )}
      {post.classType && (
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Class Type</p>
            <p className="text-muted-foreground capitalize">
              {post.classType}
            </p>
          </div>
        </div>
      )}
      {Array.isArray(post.preferredDays) && post.preferredDays.length > 0 && (
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Preferred Days</p>
            <p className="text-muted-foreground break-words">
              {post.preferredDays.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  </CardContent>

  {/* Footer / Buttons */}
  <div className="border-t border-border/40 mt-2 p-3">
    <div
      className="
        flex flex-wrap justify-center sm:justify-evenly
        gap-2 sm:gap-3
      "
    >
      {/* General Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyPostLink}
        title="Copy post link"
        className="hover:bg-primary/10"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadCardImage}
        title="Download as image"
        className="hover:bg-primary/10"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={sharePost}
        title="Share post"
        className="hover:bg-primary/10"
      >
        <Share className="h-4 w-4" />
      </Button>

      {/* Admin Actions */}
      {showAdminActions && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit?.(post)}
            title="Edit Post"
            className="px-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant={holdStatus ? "secondary" : "destructive"}
            size="sm"
            onClick={() => onHold?.(post)}
            title={holdStatus ? "Unhold Post" : "Hold Post"}
            className={holdStatus ? "px-4 bg-yellow-200 text-yellow-900 hover:bg-yellow-300" : "px-4"}
          >
            {holdStatus ? "Unhold" : "Hold"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView?.(post)}
            title="View Details"
            className="px-4 flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </>
      )}
    </div>
  </div>
</Card>

  );
}
