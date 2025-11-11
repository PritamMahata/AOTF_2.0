"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Badge } from "@aotf/ui/components/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Phone, Mail, MapPin, BookOpen } from "lucide-react";
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

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
}

interface Post {
  _id: string;
  postId: string;
  subject: string;
  className: string;
  board?: string;
  classType: string;
  location?: string;
  notes?: string;
}

interface WithdrawalRequest {
  _id: string;
  status: string;
  appliedAt: string;
  withdrawalRequestedAt: string;
  withdrawalRequestedBy: string;
  withdrawalNote?: string;
  teacher: Teacher;
  post: Post;
}

const AdminWithdrawalApproval = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();

  const fetchWithdrawalRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/applications/withdrawal-approval');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch withdrawal requests');
      }

      setRequests(data.applications || []);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching withdrawal requests:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleActionClick = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest._id);
      const response = await fetch('/api/admin/applications/withdrawal-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedRequest._id,
          action: actionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionType} withdrawal request`);
      }

      toast({
        title: "Success",
        description: data.message || `Withdrawal ${actionType}d successfully`,
      });

      // Refresh the list
      await fetchWithdrawalRequests();
      setDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      const err = error as Error;
      console.error(`Error ${actionType}ing withdrawal:`, err);
      toast({
        title: "Error",
        description: err.message || `Failed to ${actionType} withdrawal request`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Withdrawal Requests
        </h2>
        <p className="text-muted-foreground">
          Review and manage teacher application withdrawal requests
        </p>
      </div>

      {/* Summary Badge */}
      {!loading && requests.length > 0 && (
        <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
          <Clock className="mr-2 h-4 w-4" />
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </Badge>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No pending withdrawal requests</p>
              <p className="text-sm mt-2">All requests have been processed</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {requests.map((request) => (
            <Card key={request._id} className="border-l-4 border-l-orange-400">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{request.teacher.name}</span>
                  <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    Pending
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {request.teacher.teacherId}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Post Details */}
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <BookOpen className="h-4 w-4" />
                    {request.post.subject} - {request.post.className}
                  </div>
                  {request.post.board && (
                    <p className="text-sm text-muted-foreground">
                      Board: {request.post.board}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground capitalize">
                    Type: {request.post.classType}
                  </p>
                  {request.post.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {request.post.location}
                    </div>
                  )}
                  {request.post.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {request.post.notes}
                    </p>
                  )}
                </div>

                {/* Teacher Contact */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Contact Information:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {request.teacher.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {request.teacher.email}
                  </div>
                </div>

                {/* Withdrawal Details */}
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium text-orange-900">
                    Withdrawal Reason:
                  </p>
                  <p className="text-sm text-orange-800">
                    {request.withdrawalNote || 'No reason provided'}
                  </p>
                  <p className="text-xs text-orange-700 mt-2">
                    Requested on {formatDate(request.withdrawalRequestedAt)}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => handleActionClick(request, 'approve')}
                  disabled={processingId === request._id}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Approve Withdrawal'
                  )}
                </Button>
                <Button
                  onClick={() => handleActionClick(request, 'reject')}
                  disabled={processingId === request._id}
                  variant="outline"
                  className="flex-1"
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reject Request'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <>
                  This will permanently withdraw the application from{' '}
                  <strong>{selectedRequest?.teacher.name}</strong> for the post{' '}
                  <strong>{selectedRequest?.post.subject} - {selectedRequest?.post.className}</strong>.
                  <br /><br />
                  The teacher will be notified and the application status will be marked as withdrawn.
                </>
              ) : (
                <>
                  This will reject the withdrawal request and restore the application to pending status.
                  <br /><br />
                  <strong>{selectedRequest?.teacher.name}</strong> will continue to be an applicant for{' '}
                  <strong>{selectedRequest?.post.subject} - {selectedRequest?.post.className}</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={!!processingId}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWithdrawalApproval;
