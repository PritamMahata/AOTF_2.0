"use client";

import { useState, useEffect } from "react";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent } from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Filter, Loader2, Search } from "lucide-react";
import React from "react";
// Import components
import { GuardianPostCard } from "@/components/feed/guardian-post-card";
import { FeedFilters } from "@/components/feed/feed-filters";
import { AdBanner } from "@aotf/ui/ads/ad-banner";
import { useInfiniteScroll } from "@aotf/ui/hooks/use-infinite-scroll";

// Import types and hooks
import { UserRole } from "@aotf/types/src/feed";
import { useFeed } from "@aotf/ui/hooks/use-feed";

type Ad = {
  _id?: string;
  title?: string;
  imageUrl: string;
  link: string;
  status?: string;
  createdAt?: string;
};

export default function FeedPage() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/ad/show")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAds(data.ads);
      });
  }, []);

  // Helper to get a random ad from loaded ads
  const getAd = () => {
    if (ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  };

  const ad = getAd();

  // Get userRole from localStorage if available
  const getInitialRole = (): UserRole => {
    if (typeof window !== "undefined") {
      const storedRole = window.localStorage.getItem("user");
      if (storedRole === "teacher" || storedRole === "guardian") {
        return storedRole as UserRole;
      }
    }
    return "guardian";
  };

  const [userRole] = useState<UserRole>(getInitialRole());
  const [searchQuery, setSearchQuery] = useState("");
  const {
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    isTeacher,
    filteredGuardianPosts,
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
  } = useFeed(userRole);

  // Infinite scroll trigger
  const loadMoreRef = useInfiniteScroll({
    loading: loadingMore || false,
    hasMore: hasMore || false,
    onLoadMore: loadMore || (() => {}),
    threshold: 200,
  });

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilters({ ...filters, search: "" });
  };

  // Optionally allow user to switch role for demo
  return (
    <div className="min-h-screen bg-background">
      <div className="container m-auto p-6 space-y-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Teaching Opportunities
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Dedicated Search Bar */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by subject, tutor, location, budget, class..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-20 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <FeedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            isTeacher={isTeacher}
          />
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} posts
          </p>
        </div>
      </div>
      {/* Main Content */}
      <main className="m-4 flex justify-center md:justify-between pb-20">
        {/* Left Ad - Hidden on mobile, shown on md and up */}

        <div className="hidden sticky top-6 pt-10 h-fit w-[20%] rounded-lg md:flex items-center justify-center">
          {ad && <AdBanner />}
        </div>

        <div className="space-y-6 flex-1 max-w-xl">
          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading posts...</span>
              </div>
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredGuardianPosts.map((post, index) => (
                <React.Fragment key={post.id}>
                  <GuardianPostCard
                    post={post}
                    onApply={handleApply}
                    canApply={isTeacher}
                    currentUserId={currentUserId || undefined}
                  />
                  {/* Mobile Ad - Show after every 2nd post on small screens */}
                  {index % 2 === 1 && ad && (
                    <div className="md:hidden h-auto bg-gray-100 rounded-lg flex items-center justify-center my-4">
                      <AdBanner />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="py-4">
                {loadingMore && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Loading more...
                      </span>
                    </div>
                  </div>
                )}
                {!hasMore && filteredGuardianPosts.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No more posts to load
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Ad - Hidden on mobile, shown on md and up */}
        <div className="hidden sticky top-6 pt-10 h-fit w-[20%] rounded-lg md:flex items-center justify-center">
          {ad && <AdBanner />}
        </div>
      </main>
    </div>
  );
}
