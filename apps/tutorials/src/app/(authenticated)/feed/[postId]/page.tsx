"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent } from "@aotf/ui/components/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { GuardianPostCard } from "@/components/feed/guardian-post-card";
import { GuardianPost } from "@aotf/types/src/feed";
import { toast } from "sonner";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<GuardianPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get userRole from localStorage if available
  const getUserRole = () => {
    if (typeof window !== "undefined") {
      const storedRole = window.localStorage.getItem("user");
      if (storedRole === "teacher" || storedRole === "guardian") {
        return storedRole;
      }
    }
    return "guardian";
  };

  const userRole = getUserRole();

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/feed/posts/${postId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

  const playSuccessSound = (type: string) => {
    if (type === "success") {
      const audio = new window.Audio("/success.mp3");
      audio.play();
    } else if (type === "error") {
      const audio = new window.Audio("/error.mp3");
      audio.play();
    }
  };

  const handleApply = async (postId: number | string) => {
    try {
      const validPostId = typeof postId === 'string' ? postId : String(postId);
      const response = await fetch('/api/application/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: validPostId,
          message: 'I am interested in this opportunity.',
        }),
      });

      const data = await response.json();
      console.log('Apply Response Status:', response.status);
      console.log('Apply Response Data:', data);

      if (response.status === 409) {
        toast.error('You have already applied to this post.');
        playSuccessSound("error");
        return;
      }

      if (response.status === 401) {
        toast.error(data.error || 'Please login as a teacher to apply');
        playSuccessSound("error");
        return;
      }

      if (response.status === 400) {
        toast.error(data.error || 'Invalid request');
        playSuccessSound("error");
        return;
      }

      if (response.ok && data.success) {
        toast.success(data.message || 'Application submitted successfully!');
        playSuccessSound("success");
        // Optimistically update local post state instead of refetching
        setPost(prev => prev ? { ...prev, hasApplied: true, applicants: (prev.applicants || 0) + 1 } : prev);
      } else {
        toast.error(data.error || 'Failed to submit application');
        playSuccessSound("error");
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
      playSuccessSound("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading post...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The post you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => router.push('/feed')} variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            onClick={() => router.push('/feed')} 
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Posts
          </Button>
          
          <GuardianPostCard 
            post={post} 
            onApply={handleApply}
            canApply={userRole === "teacher"}
            showFullDetails={true}
          />
        </div>
      </main>
    </div>
  );
}
