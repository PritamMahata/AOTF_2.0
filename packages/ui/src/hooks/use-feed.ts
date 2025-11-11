import { useState, useMemo, useEffect } from "react";
import { GuardianPost, TutorPost, Filters, UserRole, Application } from "@aotf/types/feed";

export function useFeed(userRole: UserRole) {
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<(GuardianPost | TutorPost)[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [applicationsByPost, setApplicationsByPost] = useState<Record<string, Application[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    subject: "All subjects",
    class: "All classes",
    board: "All boards",
    location: "",
  });
  const isTeacher = userRole === "teacher";

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUserId(data.user.id);
            setCurrentUserEmail(data.user.email);
          }
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch applications for user's posts
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUserId) return;
      
      try {
        const response = await fetch('/api/application/post-details');
        if (response.ok) {
          const data = await response.json();
          setApplicationsByPost(data.applications || {});
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, [currentUserId]);
  // Fetch posts from API with pagination
  const fetchPosts = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPosts([]); // Clear posts when fetching first page
      }
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: filters.search,
        subject: filters.subject,
        class: filters.class,
        board: filters.board,
        location: filters.location
      });

      const response = await fetch(`/api/feed/posts?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      
      if (append) {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      } else {
        setPosts(data.posts || []);
      }
      
      // Update pagination metadata
      if (data.pagination) {
        setHasMore(data.pagination.hasMore);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
      if (!append) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more function for infinite scroll
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  // Reset and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchPosts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Type guard functions
  const isGuardianPost = (post: GuardianPost | TutorPost): post is GuardianPost => {
    return 'guardian' in post;
  };

  const isTutorPost = (post: GuardianPost | TutorPost): post is TutorPost => {
    return 'tutor' in post;
  };

  // Filtered lists: show all posts to everyone, and mark ownership
  const filteredGuardianPosts: GuardianPost[] = useMemo(() => {
    const guardianPosts = posts.filter(isGuardianPost);
    
    // Add ownership and application data to posts
    return guardianPosts.map(post => {
      const postKey = post.postId || String(post.id);
      const applications = applicationsByPost[postKey] || [];
      
      // Check if user owns this post
      // Compare userId from post with current user's ID or email
      const isOwner = currentUserId && currentUserEmail ? 
        (post.userId === currentUserId || 
         post.userId === currentUserEmail ||
         post.guardianId === currentUserId) : 
        false;
      
      return {
        ...post,
        isOwner,
        applications: isOwner ? applications : undefined,
        applicants: applications.length > 0 ? applications.length : post.applicants
      };
    });  }, [posts, currentUserId, currentUserEmail, applicationsByPost]);
  const filteredTutorPosts: TutorPost[] = useMemo(() => posts.filter(isTutorPost), [posts]);
  const filteredCount = filteredGuardianPosts.length + filteredTutorPosts.length;

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "All subjects",
      class: "All classes",
      board: "All boards",
      location: "",
    });
  };
  const playSuccessSound = (type: string) => {
    if (type === "success") {
      const audio = new window.Audio("/success.mp3");
      audio.play();
    }
    else if (type === "error") {
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
      const result = await response.json();
      console.log('Apply Response Status:', response.status);
      console.log('Apply Response Data:', result);
      
      if (response.status === 409) {
        import('sonner').then(({ toast }) => toast.error('You have already applied to this post.'));
        playSuccessSound("error");
        return;
      }
      if (!response.ok || !result.success) {
        console.error('API error:', result);
        import('sonner').then(({ toast }) => toast.error(result.error || 'Failed to submit application'));
        playSuccessSound("error");
        return;
      }
      import('sonner').then(({ toast }) => toast.success(result.message || 'Application submitted successfully!'));
      playSuccessSound("success");
      
      // Optimistically update only the applied post locally instead of refetching all
      setPosts(prev => prev.map(p => {
        // Guardian posts only
        if ('guardian' in p) {
          const gp = p as GuardianPost;
          const matches = String(gp.id) === validPostId || (gp.postId && String(gp.postId) === validPostId);
          if (matches) {
            const currentApplicants = typeof gp.applicants === 'number' ? gp.applicants : 0;
            return { ...gp, hasApplied: true, applicants: currentApplicants + 1 } as GuardianPost;
          }
        }
        return p;
      }));
    } catch (err) {
      console.error('Error submitting application:', err);
      import('sonner').then(({ toast }) => toast.error('Failed to submit application. Please try again.'));
      playSuccessSound("error");
    }
  };
  return {
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    isTeacher,
    filteredGuardianPosts,
    filteredTutorPosts,
    totalCount,
    filteredCount,
    loading,
    loadingMore,
    hasMore,
    error,
    clearFilters,
    handleApply,
    currentUserId,
    loadMore,
  };
}