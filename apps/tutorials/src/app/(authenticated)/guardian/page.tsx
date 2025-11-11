"use client";

import { useEffect, useState } from "react";
import { Button } from "@aotf/ui/components/button";
import {
  Card,
  CardContent,
} from "@aotf/ui/components/card";
import {
  AlertCircle,
  Edit,
  Link as LinkIcon,
  Share,
} from "lucide-react";
import { GuardianPostCard } from "@/components/feed/guardian-post-card";
import { toast } from "@aotf/ui/hooks/use-toast";
import Link from "next/link";
import { TeacherRequestForm, TeacherRequestData } from "@/components/forms/TeacherRequestForm";
import { Application } from "@aotf/types/src/feed";

export default function GuardianDashboard() {
  interface PostData {
    id: string | number;
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
  }
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [postsData, setPostsData] = useState<Record<string, PostData>>({});
  const [loading, setLoading] = useState(true);
  const [, setGuardianName] = useState<string>("");
  const [, setGuardianAvatar] = useState<string>("");
  const [guardianUserId, setGuardianUserId] = useState<string>("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGuardianData = async () => {
      try {
        // Fetch guardian profile to get the name and avatar
        const profileRes = await fetch("/api/guardian/profile");
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.success && profileData.guardian) {
          setGuardianName(profileData.guardian.name || "Guardian");
          setGuardianAvatar(profileData.guardian.avatar || "");
          setGuardianUserId(profileData.guardian.userId || "");
        }
      } catch (error) {
        console.error("Error fetching guardian profile:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts/list", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success) {
          const mapped: Application[] = (data.posts || []).map(
            (p: {
              _id: string;
              postId?: string;
              subject: string;
              status: string;
              createdAt: string;
              notes?: string;
              className?: string;
              preferredTime?: string;
            }) => ({
              _id: p._id,
              postId: p.postId || p._id,
              status: p.status as unknown as Application["status"],
              appliedAt: new Date(p.createdAt),
              teacher: {
                name: "Pending match",
                email: "",
              },
            })
          );
          setApplications(mapped);
          
          // Fetch full details for each post
          const postDetails: Record<string, PostData> = {};
          await Promise.all(
            mapped.map(async (app) => {
              try {
                const postRes = await fetch(`/api/posts/${app.postId}`);
                const postData = await postRes.json();
                if (postRes.ok && postData.success) {
                  postDetails[app.postId!] = postData.post;
                }
              } catch (err: unknown) {
                console.error('Error fetching post details:', err);
              }
            })
          );
          setPostsData(postDetails);
        }
      } catch {}
      setLoading(false);
    };

    fetchGuardianData();
    fetchPosts();
  }, []);

  const getPostUrl = (postId: string) => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/feed/${postId}`;
    }
    return '';
  };

  const copyPostLink = async (postId: string) => {
    const url = getPostUrl(postId);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ Link Copied!",
        description: "Post link has been copied to clipboard. Share it with teachers!",
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "❌ Failed to copy",
        description: "Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const sharePost = async (post: PostData) => {
    const shareTitle = `🎓 Teaching Opportunity - ${post.subject} (${post.class})`;
    
    let shareText = `📚 Subject: ${post.subject}
�‍🎓 Class: ${post.class} (${post.board})
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

    shareText += `\n\n🔗 View full post: ${getPostUrl(post.postId || String(post.id))}`;
    
    try {
      if ('share' in navigator) {
        const textShareData = {
          title: shareTitle,
          text: shareText
        };
        
        if (!('canShare' in navigator) || navigator.canShare(textShareData)) {
          await navigator.share(textShareData);
          toast({
            title: "✅ Shared!",
            description: "Post shared successfully.",
            duration: 3000,
          });
          return;
        }
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "✅ Copied!",
        description: "Post details copied to clipboard. Ready to share!",
        duration: 3000,
      });
    } catch (err) {
      console.error('Error sharing:', err);
      // Only show error if it's not a user cancellation
      if (err instanceof Error && err.name !== 'AbortError') {
        toast({
          title: "❌ Share Failed",
          description: "Please try copying the link instead.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleCreatePost = async (formData: TeacherRequestData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject,
          className: formData.className,
          board: formData.board,
          preferredTime: formData.preferredTime,
          preferredDays: formData.preferredDays,
          frequencyPerWeek: formData.frequencyPerWeek,
          classType: formData.classType,
          location: formData.location,
          monthlyBudget: formData.monthlyBudget ? Number(formData.monthlyBudget) : undefined,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newApp = {
          _id: data.postId || Date.now(),
          postId: data.post.postId || data.postId,
          teacher: {
            name: "Pending match",
            email: "",
          },
          subject: data.post.subject,
          status: data.post.status,
          appliedAt: new Date(data.post.createdAt || new Date().toISOString()),
          message:
            data.post.notes ||
            `Class: ${data.post.className}${
              data.post.preferredTime
                ? ", Time: " + data.post.preferredTime
                : ""
            }`,
        };
        setApplications([newApp, ...applications]);
        setShowPostForm(false);
        
        // Show success toast
        toast({
          title: "✅ Post Created!",
          description: "Your teacher request has been posted successfully. Teachers will start applying soon!",
          duration: 5000,
        });
      } else {
        console.error("Failed to create post", data.error);
        toast({
          title: "❌ Failed to Create Post",
          description: data.error || "Failed to create post. Please try again.",
          variant: "destructive",
          duration: 4000,
        });
        throw new Error(data.error || "Failed to create post");
      }
    } catch (e) {
      console.error("Failed to create post", e);
      toast({
        title: "❌ Network Error",
        description: "Unable to create post. Please check your internet connection.",
        variant: "destructive",
        duration: 4000,
      });
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Main Content */}
          <div className="w-full">
            <div className="space-y-6 pb-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Applications
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your posted requests and their current status
                  </p>
                </div>
                <Button onClick={() => setShowPostForm(true)} className="w-full sm:w-auto">
                  Request a Teacher
                </Button>
              </div>

              {showPostForm && (
                <TeacherRequestForm
                  onSubmit={handleCreatePost}
                  onCancel={() => setShowPostForm(false)}
                  isSubmitting={submitting}
                />
              )}

              <div>
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  </div>
                )}
                
                {!loading && applications.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                      <p className="text-base font-medium text-foreground">No applications yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Create your first teacher request to get started</p>
                    </CardContent>
                  </Card>
                )}
                
                {!loading && applications.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((application) => {
                      const postData = postsData[application.postId!];
                      if (!postData) {
                        // Fallback to loading or simple card if post data not loaded yet
                        return (
                          <Card key={application._id} className="hover:shadow-md transition-all duration-200">
                            <CardContent className="py-12 text-center">
                              <p className="text-sm text-muted-foreground">Loading post details...</p>
                            </CardContent>
                          </Card>
                        );
                      }
                      return (
                        <div key={application._id} className="space-y-3 p-4 border-2 border-muted rounded-lg bg-card/50">
                          <GuardianPostCard
                            post={postData}
                            onApply={() => {}}
                            canApply={false}
                            showFullDetails={true}
                            hideActionButtons={true}
                            currentUserId={guardianUserId}
                          />
                          {/* Separator Line */}
                          <div className="border-t-2 border-dashed border-muted my-3"></div>
                          {/* Action Buttons below the card */}
                          <div className="space-y-2">
                            <Link 
                              href={`/guardian/posts/edit/${application.postId}`}
                              className="block"
                            >
                              <Button size="sm" variant="outline" className="w-full">
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Edit Post
                              </Button>
                            </Link>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => copyPostLink(application.postId!)}
                              >
                                <LinkIcon className="h-3.5 w-3.5 mr-2" />
                                Copy Link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => sharePost(postData)}
                              >
                                <Share className="h-3.5 w-3.5 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
