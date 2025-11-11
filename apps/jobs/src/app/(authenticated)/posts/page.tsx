"use client";

import { useState, useEffect } from "react";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Badge } from "@aotf/ui/components/badge";
import { 
  Filter, 
  Loader2, 
  Search, 
  Clock,
  DollarSign,
  Tag,
  MapPin,
  Briefcase,
  User,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Route } from "next";
import { AdBanner } from "@aotf/ui/ads/ad-banner";

interface ClientProject {
  _id: string;
  projectId: string;
  projectTitle: string;
  category: string;
  subcategory?: string;
  description: string;
  budgetType: 'fixed' | 'hourly';
  budgetAmount?: number;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
  projectType: 'one-time' | 'ongoing' | 'consultation';
  urgency: 'flexible' | 'normal' | 'urgent';
  requiredSkills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredLocation?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: number;
  createdAt: string;
  clientName?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [ads, setAds] = useState<{ imageUrl: string; link: string }[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    category: "All",
    projectType: "All",
    budgetType: "All",
    urgency: "All",
    experienceLevel: "All",
  });

  // Fetch ads
  useEffect(() => {
    fetch("/api/ad/show")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAds(data.ads || []);
      })
      .catch(() => setAds([]));
  }, []);
  // Fetch all client projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/projects/get-all");
        
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        
        if (data.success) {
          const transformedProjects: ClientProject[] = (data.projects || []).map((project: any) => ({
            _id: project._id,
            projectId: project.projectId,
            projectTitle: project.projectTitle,
            category: project.category || "Uncategorized",
            subcategory: project.subcategory,
            description: project.description || "",
            budgetType: project.budgetType || 'fixed',
            budgetAmount: project.budgetAmount,
            budgetRangeMin: project.budgetRangeMin,
            budgetRangeMax: project.budgetRangeMax,
            projectType: project.projectType || 'one-time',
            urgency: project.urgency || 'normal',
            requiredSkills: project.requiredSkills || [],
            experienceLevel: project.experienceLevel || 'intermediate',
            preferredLocation: project.preferredLocation,
            status: project.status || 'open',
            applicants: project.applicants || 0,
            createdAt: project.createdAt,
            clientName: project.name,
          }));
          
          setProjects(transformedProjects);
        } else {
          throw new Error(data.error || "Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search and filters
  useEffect(() => {
    let result = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.requiredSkills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (filters.category !== "All") {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.projectType !== "All") {
      result = result.filter((p) => p.projectType === filters.projectType);
    }

    if (filters.budgetType !== "All") {
      result = result.filter((p) => p.budgetType === filters.budgetType);
    }

    if (filters.urgency !== "All") {
      result = result.filter((p) => p.urgency === filters.urgency);
    }

    if (filters.experienceLevel !== "All") {
      result = result.filter((p) => p.experienceLevel === filters.experienceLevel);
    }

    setFilteredProjects(result);
  }, [projects, searchQuery, filters]);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const getBudgetDisplay = (project: ClientProject) => {
    if (project.budgetAmount) {
      return `₹${project.budgetAmount.toLocaleString()}`;
    } else if (project.budgetRangeMin && project.budgetRangeMax) {
      return `₹${project.budgetRangeMin.toLocaleString()} - ₹${project.budgetRangeMax.toLocaleString()}`;
    }
    return "Budget TBD";
  };

  const getRandomAd = () => {
    if (ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  };

  const ad = getRandomAd();

  const handleClearFilters = () => {
    setFilters({
      category: "All",
      projectType: "All",
      budgetType: "All",
      urgency: "All",
      experienceLevel: "All",
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Freelance Projects
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and apply to available projects
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by project title, category, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Project Type</label>
                  <select
                    value={filters.projectType}
                    onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="All">All Types</option>
                    <option value="one-time">One-time</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Type</label>
                  <select
                    value={filters.budgetType}
                    onChange={(e) => setFilters({ ...filters, budgetType: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="All">All Budgets</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Urgency</label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="All">All Urgencies</option>
                    <option value="flexible">Flexible</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="All">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleClearFilters} variant="outline" className="w-full">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
      </div>

      <main className="m-4 flex justify-center md:justify-between pb-20">
        <div className="hidden sticky top-6 pt-10 h-fit w-[20%] rounded-lg md:flex items-center justify-center">
          {ad && <AdBanner />}
        </div>

        <div className="space-y-6 flex-1 max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading projects...</span>
              </div>
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map((project, index) => (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl">{project.projectTitle}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{project.category}</Badge>
                          {project.subcategory && (
                            <Badge variant="outline">{project.subcategory}</Badge>
                          )}
                          <Badge
                            variant={project.urgency === 'urgent' ? 'destructive' : 'default'}
                            className="capitalize"
                          >
                            {project.urgency}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {project.projectType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-semibold text-primary">
                            {getBudgetDisplay(project)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {project.budgetType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium capitalize">{project.experienceLevel}</div>
                          <div className="text-xs text-muted-foreground">Experience</div>
                        </div>
                      </div>

                      {project.preferredLocation && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{project.preferredLocation}</div>
                            <div className="text-xs text-muted-foreground">Location</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Posted</div>
                        </div>
                      </div>
                    </div>

                    {project.requiredSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Tag className="h-4 w-4" />
                          Required Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.requiredSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {project.requiredSkills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.requiredSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{project.applicants} applicants</span>
                    </div>

                    <div className="pt-2 border-t">
                      <Link href={`/posts/${project.projectId}` as Route} className="block">
                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Project Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>

                  {index % 3 === 2 && ad && (
                    <div className="md:hidden mt-4">
                      <AdBanner />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sticky top-6 pt-10 h-fit w-[20%] rounded-lg md:flex items-center justify-center">
          {ad && <AdBanner />}
        </div>
      </main>
    </div>
  );
}
