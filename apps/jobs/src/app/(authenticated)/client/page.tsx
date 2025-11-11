"use client";

import { useEffect, useState } from "react";
import { Button } from "@aotf/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Badge } from "@aotf/ui/components/badge";
import Link from "next/link";
import { Route } from "next";
import {
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Search,
  CheckCircle,
  Zap,
  Shield,
  Target,
} from "lucide-react";

interface FeaturedJob {
  _id: string;
  postId?: string;
  subject: string;
  category?: string;
  budgetAmount?: number;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
  urgency?: string;
  requiredSkills?: string[];
  preferredLocation?: string;
  createdAt: string;
  applicants?: number;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
}

export default function ClientPage() {
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch client posts
        const postsRes = await fetch("/api/client/posts");
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (postsData.success && postsData.posts) {
            setFeaturedJobs(postsData.posts.slice(0, 3));
            setStats({
              totalProjects: postsData.posts.length,
              activeProjects: postsData.posts.filter((p: FeaturedJob) => p.applicants && p.applicants > 0).length,
              totalApplications: postsData.posts.reduce((sum: number, p: FeaturedJob) => sum + (p.applicants || 0), 0),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBudgetDisplay = (job: FeaturedJob) => {
    if (job.budgetAmount) {
      return `₹${job.budgetAmount.toLocaleString()}`;
    } else if (job.budgetRangeMin && job.budgetRangeMax) {
      return `₹${job.budgetRangeMin.toLocaleString()} - ₹${job.budgetRangeMax.toLocaleString()}`;
    }
    return "Budget TBD";
  };

  const features = [
    {
      icon: Zap,
      title: "Quick Project Posting",
      description: "Post your project requirements in minutes and start receiving applications immediately.",
    },
    {
      icon: Users,
      title: "Quality Freelancers",
      description: "Access a pool of skilled professionals ready to bring your projects to life.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and secure payment processing with milestone-based payments.",
    },
    {
      icon: Target,
      title: "Project Management",
      description: "Track applications, manage deadlines, and communicate seamlessly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1 inline" />
              India's Trusted Freelance Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Find the Perfect{" "}
              <span className="text-primary">Freelancer</span>
              <br />
              for Your Next Project
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with skilled professionals, post your projects, and get quality work delivered on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/client/dashboard" passHref>
                <Button size="lg" className="text-lg px-8">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Post a Project
                </Button>
              </Link>
              <Link href="/posts" passHref>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-linear-to-br from-blue-50 to-background dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {loading ? "..." : stats.totalProjects}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects you've posted
                </p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-green-50 to-background dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {loading ? "..." : stats.activeProjects}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently receiving applications
                </p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-purple-50 to-background dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {loading ? "..." : stats.totalApplications}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Freelancers interested in your work
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Your Recent Projects */}
        {!loading && featuredJobs.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Your Recent Projects</h2>
                <p className="text-muted-foreground mt-1">Latest projects you've posted</p>
              </div>
              <Link href="/client/dashboard" passHref>
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{job.category || "General"}</Badge>
                      {job.urgency === "urgent" && (
                        <Badge variant="destructive" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{job.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">{getBudgetDisplay(job)}</span>
                    </div>

                    {job.preferredLocation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.preferredLocation}
                      </div>
                    )}

                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {job.applicants || 0} applicants
                      </div>
                    </div>

                    <Link href={`/posts/${job.postId || job._id}` as Route}>
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        View Project
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find the right talent and manage your projects efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Your Next Project?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Post your project for free and start receiving proposals from skilled freelancers within minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/dashboard" passHref>
                  <Button size="lg" className="text-lg px-8">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Post Your First Project
                  </Button>
                </Link>
                <Link href="/client/profile" passHref>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Complete Your Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to get your project done</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Project</h3>
              <p className="text-muted-foreground">
                Describe your project requirements, budget, and timeline
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Review Applications</h3>
              <p className="text-muted-foreground">
                Get proposals from qualified freelancers and choose the best fit
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Work Done</h3>
              <p className="text-muted-foreground">
                Collaborate with your freelancer and receive quality work
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}