"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aotf/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aotf/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aotf/ui/components/tabs";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  Filter,
} from "lucide-react";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Badge } from "@aotf/ui/components/badge";

// Add type for withdrawal requests
interface WithdrawalRequest {
  _id: string;
  teacherName?: string;
  teacherId?: string;
  withdrawalNote?: string;
  withdrawalRequestedAt?: string;
}

// Add type for admin notifications
interface AdminNotification {
  _id: string;
  type: 'withdrawal-request' | 'withdrawal-approved' | 'withdrawal-declined';
  applicationId: string;
  teacherId: string;
  teacherName: string;
  teacherCustomId: string;
  postDetails?: {
    postId: string;
    guardianName: string;
    subject: string;
    location: string;
  };
  withdrawalNote?: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNote?: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsManagement() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<AdminNotification[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);
  const itemsPerPage = 10;

  // Fetch withdrawal requests
  useEffect(() => {
    fetch("/api/admin/withdrawal-requests")
      .then((res) => res.json())
      .then((data) => setWithdrawalRequests(data.requests || []));
  }, []);

  // Fetch notification history
  const fetchNotificationHistory = useCallback(async () => {
    setLoading(true);
    console.log('[Notifications] Fetching with filters:', { statusFilter, currentPage });
    
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', itemsPerPage.toString());
      params.append('skip', ((currentPage - 1) * itemsPerPage).toString());
      
      const url = `/api/admin/notifications?${params.toString()}`;
      console.log('[Notifications] Fetching from:', url);
      
      const response = await fetch(url);
      console.log('[Notifications] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Notifications] API Response:', data);
      
      if (response.ok && data.success) {
        setNotificationHistory(data.notifications || []);
        setTotalNotifications(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        console.log('[Notifications] Set notifications:', data.notifications?.length || 0);
        console.log('[Notifications] Total:', data.total, 'Pages:', Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('[Notifications] API returned error:', data.error || 'Unknown error');
        console.error('[Notifications] Full response:', data);
        // Set empty array on error
        setNotificationHistory([]);
        setTotalNotifications(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('[Notifications] Failed to fetch notifications:', error);
      setNotificationHistory([]);
      setTotalNotifications(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    console.log('[Notifications] Effect triggered');
    fetchNotificationHistory();
  }, [fetchNotificationHistory]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleApproveWithdrawal = async (applicationId: string) => {
    await fetch(`/api/admin/withdrawal-requests/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });
    setWithdrawalRequests((prev) => prev.filter((r) => r._id !== applicationId));
    // Refresh notification history after approval
    fetchNotificationHistory();
  };

  const handleDeclineWithdrawal = async (applicationId: string) => {
    await fetch(`/api/admin/withdrawal-requests/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });
    setWithdrawalRequests((prev) => prev.filter((r) => r._id !== applicationId));
    // Refresh notification history after decline
    fetchNotificationHistory();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "declined":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <PermissionGuard permission="notifications">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications Management
            </h1>
            <p className="text-muted-foreground">
              View and manage withdrawal request notifications
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Email Delivered
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">892</div>
              <p className="text-xs text-muted-foreground">95.2% success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">355</div>
              <p className="text-xs text-muted-foreground">28.5% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Templates
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4" />
              Pending Requests
              {withdrawalRequests.length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {withdrawalRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Bell className="h-4 w-4" />
              Notification History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {withdrawalRequests.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Requests</CardTitle>
                  <CardDescription>Approve or decline teacher withdrawal requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((req) => (
                        <TableRow key={req._id}>
                          <TableCell className="font-mono text-xs">{req._id}</TableCell>
                          <TableCell className="font-medium">{req.teacherName || req.teacherId}</TableCell>
                          <TableCell className="max-w-xs truncate">{req.withdrawalNote || '-'}</TableCell>
                          <TableCell>{req.withdrawalRequestedAt ? new Date(req.withdrawalRequestedAt).toLocaleString() : '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproveWithdrawal(req._id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeclineWithdrawal(req._id)}>
                                Decline
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    There are no withdrawal requests waiting for approval.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle>Notification History</CardTitle>
                    <CardDescription>
                      View all withdrawal request notifications and their status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center">
                    <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : notificationHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Post Details</TableHead>
                        <TableHead>Withdrawal Note</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Processed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notificationHistory.map((notification) => (
                        <TableRow key={notification._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{notification.teacherName}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {notification.teacherCustomId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.postDetails ? (
                              <div className="text-sm">
                                <div className="font-medium">{notification.postDetails.guardianName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {notification.postDetails.subject} • {notification.postDetails.location}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Post: {notification.postDetails.postId}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={notification.withdrawalNote || ''}>
                              {notification.withdrawalNote || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(notification.status)}
                              {getStatusBadge(notification.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(notification.requestedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {notification.processedAt 
                              ? new Date(notification.processedAt).toLocaleString()
                              : <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-10 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                    <p className="text-muted-foreground">
                      {statusFilter !== 'all'
                        ? 'No notifications match your filter.'
                        : 'No withdrawal notifications have been recorded yet.'}
                    </p>
                  </div>
                )}
                
                {/* Pagination */}
                {!loading && notificationHistory.length > 0 && totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalNotifications)} of {totalNotifications} notifications
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            if (page === 1 || page === totalPages) return true;
                            if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                            return false;
                          })
                          .map((page, idx, arr) => {
                            // Add ellipsis if there's a gap
                            const prevPage = arr[idx - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-muted-foreground">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="min-w-[40px]"
                                >
                                  {page}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
