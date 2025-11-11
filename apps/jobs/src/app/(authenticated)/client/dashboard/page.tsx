"use client";

import { useEffect, useState } from "react";
import { Button } from "@aotf/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import {
  AlertCircle,
  Edit,
  Link as LinkIcon,
  Share,
  Clock,
  DollarSign,
  Tag,
  Users,
  ExternalLink,
} from "lucide-react";
import { toast } from "@aotf/ui/hooks/use-toast";
import Link from "next/link";
import { ClientProjectForm, ClientProjectData } from "@/components/forms/ClientProjectForm";
import { Route } from "next";
import { Badge } from "@aotf/ui/components/badge";

export default function ClientDashboard() {
  interface ProjectData {
    _id: string;
    postId?: string;
    userId?: string;
    clientId?: string;
    subject: string;
    className: string;
    category?: string;
    subcategory?: string;
    description: string;
    budgetAmount?: number;
    budgetRangeMin?: number;
    budgetRangeMax?: number;
    budgetType?: string;
    projectType?: string;
    urgency?: string;
    requiredSkills?: string[];
    experienceLevel?: string;
    freelancerType?: string;
    preferredLocation?: string;
    status: string;
    createdAt: string;
    applicants?: number;
  }
  
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientUserId, setClientUserId] = useState<string>("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const profileRes = await fetch("/api/client/profile");
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.success && profileData.client) {
          setClientUserId(profileData.client.userId || "");
        }
      } catch (error) {
        console.error("Error fetching client profile:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/client/posts", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success) {
          setProjects(data.posts || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
      setLoading(false);
    };

    fetchClientData();
    fetchProjects();
  }, []);

  const getPostUrl = (postId: string) => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/posts/${postId}`;
    }
    return '';
  };

  const copyPostLink = async (postId: string) => {
    const url = getPostUrl(postId);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ Link Copied!",
        description: "Project link has been copied to clipboard.",
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "❌ Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareProject = async (project: ProjectData) => {
    const shareTitle = `💼 Freelance Project - ${project.subject}`;
    
    let shareText = `📚 Project: ${project.subject}
📂 Category: ${project.category}`;

    if (project.description) {
      shareText += `\n\n📝 Description:\n${project.description}`;
    }

    if (project.budgetAmount) {
      shareText += `\n💰 Budget: ₹${project.budgetAmount}`;
    } else if (project.budgetRangeMin && project.budgetRangeMax) {
      shareText += `\n💰 Budget: ₹${project.budgetRangeMin} - ₹${project.budgetRangeMax}`;
    }

    if (project.urgency) {
      shareText += `\n⚡ Urgency: ${project.urgency}`;
    }

    shareText += `\n\n🔗 View full project: ${getPostUrl(project.postId || project._id)}`;
      try {
      if ('share' in navigator && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText
        });
        toast({
          title: "✅ Shared!",
          description: "Project shared successfully.",
        });
        return;
      }
      
      // Fallback to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "✅ Copied!",
          description: "Project details copied to clipboard.",
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast({
          title: "❌ Share Failed",
          description: "Please try copying the link instead.",
          variant: "destructive",
        });
      }
    }
  };
  const handleCreatePost = async (formData: ClientProjectData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: formData.projectTitle,
          category: formData.category,
          description: formData.description,
          subcategory: formData.subcategory,
          projectType: formData.projectType,
          budgetType: formData.budgetType,
          budgetAmount: formData.budgetAmount,
          budgetRangeMin: formData.budgetRangeMin,
          budgetRangeMax: formData.budgetRangeMax,
          expectedHours: formData.expectedHours,
          startDate: formData.startDate,
          deadline: formData.deadline,
          duration: formData.duration,
          urgency: formData.urgency,
          requiredSkills: formData.requiredSkills,
          experienceLevel: formData.experienceLevel,
          freelancerType: formData.freelancerType,
          preferredLocation: formData.preferredLocation,
          languageRequirements: formData.languageRequirements,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects([data.project || data.post, ...projects]);
        setShowPostForm(false);
        
        toast({
          title: "✅ Project Posted!",
          description: "Your project has been posted successfully.",
          duration: 5000,
        });
      } else {
        throw new Error(data.error || "Failed to create project");
      }
    } catch (e) {
      console.error("Failed to create project", e);
      toast({
        title: "❌ Failed to Create Project",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  const getBudgetDisplay = (project: ProjectData) => {
    if (project.budgetAmount) {
      return `₹${project.budgetAmount.toLocaleString()}`;
    } else if (project.budgetRangeMin && project.budgetRangeMax) {
      return `₹${project.budgetRangeMin.toLocaleString()} - ₹${project.budgetRangeMax.toLocaleString()}`;
    }
    return "Budget TBD";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6 pb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                My Projects
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your posted projects and their current status
              </p>
            </div>
            <Button onClick={() => setShowPostForm(true)} className="w-full sm:w-auto">
              Post a Project
            </Button>
          </div>

          {showPostForm && (
            <ClientProjectForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowPostForm(false)}
              isSubmitting={submitting}
            />
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          )}
          
          {!loading && projects.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-base font-medium text-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
              </CardContent>
            </Card>
          )}
          
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg line-clamp-2">{project.subject}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.category && (
                            <Badge variant="secondary">{project.category}</Badge>
                          )}
                          {project.subcategory && (
                            <Badge variant="outline">{project.subcategory}</Badge>
                          )}
                          {project.urgency && (
                            <Badge 
                              variant={project.urgency === 'urgent' ? 'destructive' : 'default'}
                              className="capitalize"
                            >
                              {project.urgency}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Budget */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">{getBudgetDisplay(project)}</span>
                      {project.budgetType && (
                        <Badge variant="outline" className="text-xs">
                          {project.budgetType}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>
                    )}

                    {/* Skills */}
                    {project.requiredSkills && project.requiredSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Tag className="h-3 w-3" />
                          Skills Required
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {project.requiredSkills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.requiredSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Applicants */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.applicants || 0} applicants</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t">
                      <Link 
                        href={`/posts/${project.postId || project._id}` as Route}
                        className="block"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          View Full Project
                        </Button>
                      </Link>
                      <Link 
                        href={`/client/posts/edit/${project.postId || project._id}` as Route}
                        className="block"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          Edit Project
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => copyPostLink(project.postId || project._id)}
                        >
                          <LinkIcon className="h-3.5 w-3.5 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => shareProject(project)}
                        >
                          <Share className="h-3.5 w-3.5 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
