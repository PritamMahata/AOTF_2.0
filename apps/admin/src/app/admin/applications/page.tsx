"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Badge } from "@aotf/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aotf/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@aotf/ui/components/dialog";
import {
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/admin/permission-guard";

// Define the types
interface Teacher {
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  experience?: string;
  qualifications?: string;
  subjectsTeaching?: string[];
  teachingMode?: string;
  bio?: string;
  hourlyRate?: string;
  availability?: string;
  rating?: number;
  totalGuardians?: number;
  avatar?: string;
  whatsappNumber?: string;
}

interface Post {
  postId: string;
  subject?: string;
  class?: string;
  board?: string;
}

interface Application {
  _id: string;
  status: string;
  appliedAt: string;
  teacher: Teacher;
  postId: string;
  post?: Post;
}

export default function ApplicationsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId"); // Get postId from query params
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  // ✅ useCallback ensures fetchApplications is stable between renders
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = postId
        ? `/api/application/list?postId=${postId}`
        : "/api/admin/applications/all";

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch applications: ${res.status} ${errorText}`
        );
      }

      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      if (err instanceof Error) {
        setError(err.message || "Error fetching applications");
      } else {
        setError("Unknown error fetching applications");
      }
    } finally {
      setLoading(false);
    }
  }, [postId]); // ✅ dependency added here

  // ✅ ESLint and logic both correct
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.teacher?.teacherId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.postId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleApplicationAction = async (
    action: "approve" | "decline",
    applicationId: string
  ): Promise<void> => {
    let status = "";
    if (action === "approve") status = "approved";
    if (action === "decline") status = "declined";
    if (!status) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/application/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });

      if (!res.ok) throw new Error("Failed to update application status");

      const data = await res.json();

      // Show success toast with auto-decline count if approving
      if (action === "approve" && data.autoDeclinedCount > 0) {
        toast({
          title: "Application Approved! ✅",
          description: `Successfully approved application. ${
            data.autoDeclinedCount
          } other pending application${
            data.autoDeclinedCount > 1 ? "s were" : " was"
          } automatically declined.`,
          duration: 5000,
        });
      } else if (action === "approve") {
        toast({
          title: "Application Approved! ✅",
          description: "Successfully approved the application.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Application Declined",
          description: "Successfully declined the application.",
          duration: 3000,
        });
      }

      // Refetch applications
      fetchApplications();
    } catch (err) {
      console.error("Error updating application status:", err);
      setError((err as Error).message || "Error updating status");
      toast({
        title: "Error",
        description:
          (err as Error).message || "Failed to update application status",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = (postIdToView: string) => {
    // If we're already viewing a specific post's applications, go back to all applications
    // Otherwise, filter to show only that post's applications
    if (postId) {
      router.push(`/admin/applications`);
    } else {
      router.push(`/admin/applications?postId=${postIdToView}`);
    }
  };

  const handleViewTeacherDetails = (application: Application) => {
    setSelectedApplication(application);
  };

  // const exportToCSV = () => {
  //   const csvData = filteredApplications.map(app => ({
  //     'Application ID': app._id,
  //     'Teacher Name': app.teacher?.name || 'N/A',
  //     'Teacher ID': app.teacher?.teacherId || 'N/A',
  //     'Phone': app.teacher?.phone || 'N/A',
  //     'Email': app.teacher?.email || 'N/A',
  //     'Post ID': app.postId,
  //     'Applied Date': app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A',
  //     'Status': app.status,
  //   }))

  //   // Convert to CSV
  //   const headers = Object.keys(csvData[0] || {})
  //   const csv = [
  //     headers.join(','),
  //     ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
  //   ].join('\n')

  //   // Download
  //   const blob = new Blob([csv], { type: 'text/csv' })
  //   const url = window.URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
  //   a.click()
  //   window.URL.revokeObjectURL(url)
  // }

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    completed: applications.filter((a) => a.status === "completed").length,
    declined: applications.filter((a) => a.status === "declined").length,
  };

  return (
    <PermissionGuard permission="applications">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              {postId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/applications")}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {postId ? `Applications for Post` : "Applications Management"}
                </h1>
                <p className="text-muted-foreground">
                  {postId
                    ? `Viewing applications for post ID: ${postId.slice(
                        0,
                        12
                      )}...`
                    : "Track and manage teacher applications for tuition posts"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchApplications()}>
              Refresh
            </Button>
            {/* <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={filteredApplications.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("all")}
          >
            <CardHeader className="justify-center">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 dark:border-yellow-800"
            onClick={() => setFilterStatus("pending")}
          >
            <CardHeader className="justify-center">
              <CardDescription className="text-yellow-600 dark:text-yellow-400">
                Pending
              </CardDescription>
              <CardTitle className="text-3xl text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800"
            onClick={() => setFilterStatus("approved")}
          >
            <CardHeader className="justify-center">
              <CardDescription className="text-green-600 dark:text-green-400">
                Approved
              </CardDescription>
              <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                {stats.approved}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 dark:border-blue-800"
            onClick={() => setFilterStatus("completed")}
          >
            <CardHeader className="justify-center">
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Completed
              </CardDescription>
              <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-red-200 dark:border-red-800"
            onClick={() => setFilterStatus("declined")}
          >
            <CardHeader className="justify-center">
              <CardDescription className="text-red-600 dark:text-red-400">
                Declined
              </CardDescription>
              <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                {stats.declined}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by teacher, ID, or post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "approved" ? "default" : "outline"}
              onClick={() => setFilterStatus("approved")}
              size="sm"
            >
              Approved
            </Button>
          </div>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {postId ? "Post Applications" : "All Applications"}
            </CardTitle>
            <CardDescription>
              {filterStatus === "all"
                ? postId
                  ? "Applications for this specific post"
                  : "All teacher applications across all posts"
                : `Showing ${filterStatus} applications`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading applications...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    No applications found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {searchTerm
                      ? "No applications match your search criteria. Try adjusting your search."
                      : applications.length === 0
                      ? postId
                        ? "No applications have been submitted for this post yet."
                        : "No applications have been submitted yet."
                      : `No ${filterStatus} applications found.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Post ID</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>{application._id.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">
                                {application.teacher?.name || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {application.teacher?.teacherId || ""}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.teacher?.phone || "N/A"}
                        </TableCell>
                        
                        <TableCell className="text-sm">
                          {application.appliedAt
                            ? new Date(
                                application.appliedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "pending"
                                ? "secondary"
                                : application.status === "approved"
                                ? "default"
                                : application.status === "declined"
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100"
                                : application.status === "approved"
                                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100"
                                : application.status === "declined"
                                ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100"
                                : application.status === "completed"
                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100"
                                : ""
                            }
                          >
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!postId && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => handleViewPost(application.postId)}
                            >
                              {application.postId.slice(0, 12)}...
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {application.status === "pending" && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleApplicationAction(
                                      "approve",
                                      application._id
                                    )
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleApplicationAction(
                                      "decline",
                                      application._id
                                    )
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                            {application.status === "approved" && (
                              <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                                <CheckCircle className="h-4 w-4" />
                                Approved
                              </div>
                            )}
                            {application.status === "declined" && (
                              <div className="flex items-center justify-end gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                                <XCircle className="h-4 w-4" />
                                Declined
                              </div>
                            )}
                            {application.status === "completed" && (
                              <div className="flex items-center justify-end gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                <CheckCircle className="h-4 w-4" />
                                Completed
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleViewTeacherDetails(application)
                              }
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher Details Dialog */}
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Teacher Application Details</DialogTitle>
              <DialogDescription>
                Complete information about the teacher and application
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Application ID
                  </label>
                  <p className="text-sm font-mono">{selectedApplication._id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Applied Date
                  </label>
                  <p className="text-sm">
                    {selectedApplication.appliedAt
                      ? new Date(
                          selectedApplication.appliedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    variant={
                      selectedApplication.status === "pending"
                        ? "secondary"
                        : selectedApplication.status === "approved"
                        ? "default"
                        : selectedApplication.status === "completed"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      selectedApplication.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : selectedApplication.status === "approved"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : selectedApplication.status === "declined"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : selectedApplication.status === "completed"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : ""
                    }
                  >
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Post ID
                  </label>
                  <p className="text-sm font-mono">
                    {selectedApplication.postId}
                  </p>
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Teacher Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">
                    {selectedApplication.teacher?.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Teacher ID
                  </label>
                  <p className="text-sm font-mono">
                    {selectedApplication.teacher?.teacherId || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">
                    {selectedApplication.teacher?.email || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <p className="text-sm">
                    {selectedApplication.teacher?.phone || "N/A"}
                  </p>
                </div>
                {selectedApplication.teacher?.whatsappNumber && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      WhatsApp
                    </label>
                    <p className="text-sm">
                      {selectedApplication.teacher.whatsappNumber}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <p className="text-sm">
                    {selectedApplication.teacher?.location || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Experience
                  </label>
                  <p className="text-sm">
                    {selectedApplication.teacher?.experience || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Teaching Mode
                  </label>
                  <p className="text-sm capitalize">
                    {selectedApplication.teacher?.teachingMode || "N/A"}
                  </p>
                </div>
                {selectedApplication.teacher?.subjectsTeaching &&
                  selectedApplication.teacher.subjectsTeaching.length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Subjects Teaching
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.teacher.subjectsTeaching.map(
                          (subject, idx) => (
                            <Badge key={idx} variant="secondary">
                              {subject}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {selectedApplication.teacher?.qualifications && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Qualifications
                    </label>
                    <p className="text-sm">
                      {selectedApplication.teacher.qualifications}
                    </p>
                  </div>
                )}
                {selectedApplication.teacher?.bio && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Bio
                    </label>
                    <p className="text-sm">{selectedApplication.teacher.bio}</p>
                  </div>
                )}
                {selectedApplication.teacher?.hourlyRate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Hourly Rate
                    </label>
                    <p className="text-sm">
                      ₹{selectedApplication.teacher.hourlyRate}
                    </p>
                  </div>
                )}
                {selectedApplication.teacher?.availability && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Availability
                    </label>
                    <p className="text-sm">
                      {selectedApplication.teacher.availability}
                    </p>
                  </div>
                )}
                {selectedApplication.teacher?.rating && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Rating
                    </label>
                    <p className="text-sm">
                      {selectedApplication.teacher.rating} / 5
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
