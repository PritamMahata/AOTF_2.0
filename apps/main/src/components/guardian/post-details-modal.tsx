"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@aotf/ui/components/dialog";
import { GuardianPostCard } from "@/components/feed/guardian-post-card";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { GuardianPost } from '@/types/feed';

interface PostDetailsModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDetailsModal({ postId, isOpen, onClose }: PostDetailsModalProps) {
  const [post, setPost] = useState<GuardianPost | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPost(data.post as GuardianPost);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch post details",
          variant: "destructive",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      toast({
        title: "Error",
        description: "Failed to load post details",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [postId, onClose]);

  useEffect(() => {
    if (postId && isOpen) {
      fetchPostDetails();
    }
  }, [postId, isOpen, fetchPostDetails]);

  const handleApply = () => {
    // This won't be called for guardian's own posts
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : post ? (
          <div className="mt-4">
            <GuardianPostCard
              post={post}
              onApply={handleApply}
              canApply={false}
              showFullDetails={true}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
