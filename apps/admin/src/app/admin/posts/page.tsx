"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardDescription, CardTitle } from "@aotf/ui/components/card";
import { Button } from "@aotf/ui/components/button";
import { Dialog, DialogContent, DialogHeader } from "@aotf/ui/components/dialog";
import { Filter, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AdminPostCard } from "@/components/admin/admin-post-card";
import { GuardianPost } from "@/types/feed";
import {
  TeacherRequestForm,
  TeacherRequestData,
} from "@/components/forms/TeacherRequestForm";
import { Input } from "@aotf/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aotf/ui/components/select";
import { PermissionGuard } from "@/components/admin/permission-guard";

// Define Post interface matching IPost
interface Post {
  postId: string;
  guardianId?: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  subject: string;
  className: string;
  board?: "CBSE" | "ICSE" | "ISC" | "WBBSE" | "WBCHS";
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: "once" | "twice" | "thrice" | "custom";
  classType: "online" | "in-person" | "both";
  monthlyBudget?: number;
  notes?: string;
  status: "hold" | "open" | "matched" | "closed";
  createdAt: string;
  updatedAt: string;
  applicants: string[];
}

export default function PostsManagement() {
  interface Application {
    id: string;
    tutor: string;
    subject: string;
    status: string;
    appliedDate: string;
    message: string;
  }
  const [applications, setApplications] = useState<Application[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  // const [showQueue, setShowQueue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [classTypeFilter, setClassTypeFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(12); // 12 posts per page for grid layout

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
          monthlyBudget: formData.monthlyBudget
            ? Number(formData.monthlyBudget)
            : undefined,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newApp = {
          id: data.postId || Date.now(),
          tutor: "Pending match",
          subject: data.post.subject,
          status: data.post.status,
          appliedDate: data.post.createdAt || new Date().toISOString(),
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

        // Refresh posts list with current page
        const postsRes = await fetch(
          `/api/posts/get-all?page=${currentPage}&limit=${limit}`
        );
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } else {
        console.error("Failed to create post", data.error);
        throw new Error(data.error || "Failed to create post");
      }
    } catch (e) {
      console.error("Failed to create post", e);
      throw e;
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError("");
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        // Add filters to query
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (subjectFilter !== 'all') params.append('subject', subjectFilter);
        if (classFilter !== 'all') params.append('className', classFilter);
        if (boardFilter !== 'all') params.append('board', boardFilter);
        if (classTypeFilter !== 'all') params.append('classType', classTypeFilter);
        if (frequencyFilter !== 'all') params.append('frequency', frequencyFilter);
        if (minBudget) params.append('minBudget', minBudget);
        if (maxBudget) params.append('maxBudget', maxBudget);

        const res = await fetch(`/api/posts/get-all?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || []);

        // Update pagination metadata
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Error fetching posts");
        } else {
          setError("Unknown error fetching posts");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [currentPage, limit, searchTerm, statusFilter, subjectFilter, classFilter, boardFilter, classTypeFilter, frequencyFilter, minBudget, maxBudget]);
  
  // Remove the old filteredPosts logic and search term reset
  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, subjectFilter, classFilter, boardFilter, classTypeFilter, frequencyFilter, minBudget, maxBudget]);

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSubjectFilter("all");
    setClassFilter("all");
    setBoardFilter("all");
    setClassTypeFilter("all");
    setFrequencyFilter("all");
    setMinBudget("");
    setMaxBudget("");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== "all" || subjectFilter !== "all" || 
    classFilter !== "all" || boardFilter !== "all" || classTypeFilter !== "all" || 
    frequencyFilter !== "all" || minBudget || maxBudget;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "open":
  //       return "default";
  //     case "matched":
  //       return "secondary";
  //     case "closed":
  //       return "outline";
  //     default:
  //       return "secondary";
  //   }
  // };

  // Map Post to GuardianPost for AdminPostCard
  function mapPostToGuardianPost(post: Post): GuardianPost {
    return {
      id: post.postId,
      postId: post.postId,
      guardian: post.name || "Anonymous Guardian",
      guardianId: post.guardianId,
      guardianEmail: post.email,
      guardianPhone: post.phone,
      guardianLocation: undefined, // Not available in Post
      guardianWhatsapp: undefined, // Not available in Post
      subject: post.subject,
      class: `Class - ${post.className}`,
      board: post.board || "Not specified",
      location: undefined, // Not available in Post
      budget: post.monthlyBudget
        ? `₹${post.monthlyBudget}/month`
        : "Not specified",
      monthlyBudget: post.monthlyBudget,
      genderPreference: "No preference",
      description: post.notes || "No additional details provided",
      postedDate: formatDate(post.createdAt),
      applicants: post.applicants.length,
      status: post.status,
      classType: post.classType,
      frequency: post.frequencyPerWeek,
      preferredTime: post.preferredTime,
      preferredDays: post.preferredDays,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
    };
  }

  // Handler for View button
  const handleView = (post: Post) => {
    // Navigate to unified applications page with postId filter
    router.push(`/admin/applications?postId=${post.postId}`);
  };

  // Handler for Edit button
  const handleEdit = (post: Post) => {
    console.log('🔧 Edit button clicked for post:', post.postId);
    console.log('🔧 Navigating to:', `/admin/posts/edit/${post.postId}`);
    // Navigate to edit page for this post
    router.push(`/admin/posts/edit/${post.postId}`);
  };

  // Handler for Hold/Unhold button
  const handleToggleHold = async (post: Post) => {
    setError("");
    // Optimistically update the UI for the toggled post only
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === post.postId
          ? { ...p, status: p.status === "hold" ? "open" : "hold" }
          : p
      )
    );
    try {
      const newStatus = post.status === "hold" ? "open" : "hold";
      const res = await fetch("/api/posts/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.postId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update post status");
      // No need to update posts again, already done optimistically
    } catch (err: unknown) {
      // Rollback optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === post.postId
            ? { ...p, status: post.status } // revert to original
            : p
        )
      );
      if (err instanceof Error) {
        setError(err.message || "Error updating post status");
      } else {
        setError("Unknown error updating post status");
      }
    }
  };

  return (
    <PermissionGuard permission="posts">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Tuition Posts Management
            </h1>
            <p className="text-muted-foreground">
              Manage tuition requirements and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {hasActiveFilters && `(${[searchTerm, statusFilter !== "all", subjectFilter !== "all", classFilter !== "all", boardFilter !== "all", classTypeFilter !== "all", frequencyFilter !== "all", minBudget, maxBudget].filter(Boolean).length})`}
            </Button>
            <Button onClick={() => setShowPostForm(true)}>
              Request a Teacher
            </Button>
          </div>
        </div>

        {/* Search and Filters Section */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filter Posts</h2>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by Post ID, tutor, subject, class, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Bengali">Bengali</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Accountancy">Accountancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
                    <SelectItem value="4">Class 4</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Board Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Board</label>
                <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All boards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Boards</SelectItem>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="ISC">ISC</SelectItem>
                    <SelectItem value="WBBSE">WBBSE</SelectItem>
                    <SelectItem value="WBCHS">WBCHS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Type</label>
                <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="once">Once per week</SelectItem>
                    <SelectItem value="twice">Twice per week</SelectItem>
                    <SelectItem value="thrice">Thrice per week</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                {searchTerm && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {statusFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {subjectFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Subject: {subjectFilter}
                    <button onClick={() => setSubjectFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {classFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Class: {classFilter}
                    <button onClick={() => setClassFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {boardFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Board: {boardFilter}
                    <button onClick={() => setBoardFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {classTypeFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Type: {classTypeFilter}
                    <button onClick={() => setClassTypeFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {frequencyFilter !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Frequency: {frequencyFilter}
                    <button onClick={() => setFrequencyFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {minBudget && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Min: ₹{minBudget}
                    <button onClick={() => setMinBudget("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {maxBudget && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Max: ₹{maxBudget}
                    <button onClick={() => setMaxBudget("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showPostForm && (
          <TeacherRequestForm
            onSubmit={handleCreatePost}
            onCancel={() => setShowPostForm(false)}
            isSubmitting={submitting}
          />
        )}
        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading posts...
          </div>
        )}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}
        
        {/* No Results State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground text-lg">No posts found matching your filters</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
        
        {/* Posts Table */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="flex gap-4 flex-wrap">
              {posts.map((post, index: number) => (
                <AdminPostCard
                  key={index}
                  post={mapPostToGuardianPost(post)}
                  onApply={() => {}}
                  canApply={false}
                  onView={() => handleView(post)}
                  onEdit={() => handleEdit(post)}
                  onHold={() => handleToggleHold(post)}
                  showAdminActions={true}
                  holdStatus={post.status === "hold"}
                />
              ))}
            </div>
          </>
        )}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {posts.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{" "}
              {Math.min(currentPage * limit, totalCount)} of {totalCount} posts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        {/* Post Details Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Complete information about the tuition requirement
              </CardDescription>
            </DialogHeader>
            {selectedPost && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Post ID</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.postId}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Name</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.subject || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.className}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Board</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.board || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Time</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.preferredTime || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Days</label>
                  <p className="text-sm text-muted-foreground">
                    {(selectedPost?.preferredDays || []).join(", ") || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Frequency Per Week
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.frequencyPerWeek}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class Type</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.classType}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Budget</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.monthlyBudget
                      ? `₹${selectedPost?.monthlyBudget}`
                      : "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Applicants</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.applicants.length}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost?.notes || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Created At</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost ? formatDate(selectedPost.createdAt) : "-"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
