"use client";
import { Badge } from "@aotf/ui/components/badge";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent } from "@aotf/ui/components/card";
import { Clock, CheckCircle, XCircle, Loader2, MapPin, Calendar, BookOpen, Share2, X, Copy, User, Mail, Phone } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@aotf/ui/hooks/use-toast";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@aotf/ui/components/alert-dialog";
import { Textarea } from "@aotf/ui/components/textarea";
import { Route } from "next";

interface Post {
  _id: string;
  postId: string;
  subject: string;
  className: string;
  board?: string;
  classType: string;
  location?: string;
  monthlyBudget?: number;
  notes?: string;
  status: string;
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: string;
  createdAt: string;
  name?: string;
  email?: string;
  phone?: string;
  applicants?: string[];
}

interface Application {
  _id: string;
  applicationId: string;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'withdrawal-requested' | 'withdrawn';
  appliedAt: string;
  declinedAt?: string;
  declineReason?: string;
  autoDeclined?: boolean;
  withdrawalRequestedAt?: string;
  withdrawalNote?: string;
  post: Post | null;
}

const QUICK_TEXTS = [
  "Personal reasons",
  "Found a better opportunity",
  "Schedule conflict",
  "Not interested anymore",
  "Other (please specify)"
];

/**
 * Parse decline reason text and render links
 * Format: [LINK:postId:displayText] -> clickable link
 */
const parseDeclineReason = (text: string) => {
  const linkRegex = /\[LINK:([^:]+):([^\]]+)\]/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the link
    const postId = match[1];
    const displayText = match[2];
    parts.push(
      <Link
        key={match.index}
        href={`/posts/${postId}` as Route}
        className="text-blue-600 hover:text-blue-800 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {displayText}
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawalNote, setWithdrawalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/freelancer/applications');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }

      setApplications(data.applications || []);
    } catch (error: unknown) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);
  const handleCopyLink = (application: Application) => {
    const link = `${window.location.origin}/posts?post=${application.post?.postId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Post link copied to clipboard",
    });
  };

  const handleShare = async (application: Application) => {
    const link = `${window.location.origin}/posts?post=${application.post?.postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: application.post?.subject || 'Post',
          text: `Check out this post: ${application.post?.subject} - ${application.post?.className}`,
          url: link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink(application);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
      case 'once': return 'Once/Week';
      case 'twice': return 'Twice/Week';
      case 'thrice': return 'Thrice/Week';
      default: return frequency;
    }
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const handleWithdrawalRequest = (application: Application) => {
    setSelectedApplication(application);
    setWithdrawalNote("");
    setWithdrawalDialogOpen(true);
  };

  const handleQuickText = (text: string) => {
    setWithdrawalNote((prev) => prev ? prev + " " + text : text);
  };

  const submitWithdrawalRequest = async () => {
    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/freelancer/applications/request-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication._id,
          withdrawalNote: withdrawalNote.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      toast({
        title: "Success",
        description: "Withdrawal request submitted. Waiting for admin approval.",
      });

      // Optimistically update only the selected application locally instead of refetching all
      setApplications(prev => prev.map(app =>
        app._id === selectedApplication._id
          ? {
              ...app,
              status: 'withdrawal-requested',
              withdrawalRequestedAt: new Date().toISOString(),
              withdrawalNote: withdrawalNote.trim(),
            }
          : app
      ));

      setWithdrawalDialogOpen(false);
      setSelectedApplication(null);
      setWithdrawalNote("");
    } catch (error: unknown) {
      console.error('Error submitting withdrawal request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit withdrawal request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Declined
          </Badge>
        );
      case 'withdrawal-requested':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="mr-1 h-3 w-3" />
            Withdrawal Pending
          </Badge>
        );
      case 'withdrawn':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <X className="mr-1 h-3 w-3" />
            Withdrawn
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-zinc-100 text-black border-zinc-200">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Your Applications
        </h2>
        <p className="text-muted-foreground">
          Review and manage your applications
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No applications yet</p>
              <p className="text-sm mt-2">Start applying to posts to see them here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((application) => (
            <Card key={application._id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-foreground">
                        {application.post?.subject || 'Subject not available'}
                      </h3>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          {application.post?.monthlyBudget 
                            ? `Budget: ₹${application.post.monthlyBudget}/month`
                            : 'Budget not specified'
                          }
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(application.appliedAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge - Prominent */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {application.post?.applicants && Array.isArray(application.post.applicants) ? (
                          <span>{application.post.applicants.length} applicant{application.post.applicants.length !== 1 ? 's' : ''}</span>
                        ) : (
                          <span>0 applicants</span>
                        )}
                      </div>
                      {getStatusBadge(application.status)}
                    </div>                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {application.post?.postId ? (
                        <a 
                          href={`/posts/${application.post._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer transition-colors"
                          >
                            {application.post.postId}
                          </Badge>
                        </a>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          N/A
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {application.post?.className || 'Class not specified'}
                      </Badge>
                      {application.post?.board && (
                        <Badge variant="outline">{application.post.board}</Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {application.post?.classType || 'Online'}
                      </Badge>
                    </div>
                  </div>

                  {/* Guardian Contact Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Place</h4>
                    {application.post?.name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {application.post.name}
                      </div>
                    )}
                    {application.post?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {application.post.email}
                      </div>
                    )}
                    {application.post?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {application.post.phone}
                      </div>
                    )}
                    {application.post?.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {application.post.location}
                      </div>
                    )}
                    {!application.post?.name && !application.post?.email && !application.post?.phone && !application.post?.location && (
                      <p className="text-sm text-muted-foreground">No contact information available</p>
                    )}
                  </div>

                  {/* Requirements Section */}
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-semibold text-foreground">Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.post?.notes || 'No additional details provided'}
                    </p>
                  </div>

                  {/* Frequency and Class Type */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Frequency</span>
                      </div>
                      <p className="text-sm font-medium">
                        {getFrequencyText(application.post?.frequencyPerWeek || 'once')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>Class Type</span>
                      </div>
                      <p className="text-sm font-medium capitalize">
                        {application.post?.classType || 'Online'}
                      </p>
                    </div>
                  </div>

                  {/* Withdrawal Note if exists */}
                  {application.withdrawalNote && (
                    <div className="text-sm text-muted-foreground bg-orange-50 p-3 rounded-md border border-orange-200">
                      <span className="font-medium">Withdrawal Note:</span> {application.withdrawalNote}
                    </div>
                  )}

                  {/* Decline Reason if application is declined */}
                  {application.status === 'declined' && application.declineReason && (
                    <div className="text-sm bg-red-50 p-4 rounded-md border border-red-200">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900 mb-1">
                            {application.autoDeclined ? 'Application Auto-Declined' : 'Application Declined'}
                          </p>
                          <p className="text-red-800">{parseDeclineReason(application.declineReason)}</p>
                          {application.declinedAt && (
                            <p className="text-xs text-red-700 mt-2">
                              Declined on {formatDate(application.declinedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withdrawal Pending Message */}
                  {application.status === 'withdrawal-requested' && (
                    <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-md border border-orange-200">
                      <p className="font-medium">Withdrawal request pending admin approval</p>
                      {application.withdrawalRequestedAt && (
                        <p className="text-xs mt-1">
                          Requested on {formatDate(application.withdrawalRequestedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-auto pt-4">
                    {/* Main Action Button */}
                    {(application.status === 'pending' || application.status === 'approved') && (
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        size="lg"
                        onClick={() => handleWithdrawalRequest(application)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Request for Decline
                      </Button>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex-1"
                        onClick={() => handleCopyLink(application)}
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex-1"
                        onClick={() => handleShare(application)}
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Withdrawal Request Dialog */}
      <AlertDialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Application Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              This will submit a withdrawal request to the admin for approval. 
              Please provide a reason for withdrawing this application (optional).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {/* Quick Texts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_TEXTS.map((text) => (
                <button
                  key={text}
                  type="button"
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm border border-gray-200"
                  onClick={() => handleQuickText(text)}
                >
                  {text}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Reason for withdrawal (optional)..."
              value={withdrawalNote}
              onChange={(e) => setWithdrawalNote(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {withdrawalNote.length}/500 characters
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitWithdrawalRequest}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Applications;
