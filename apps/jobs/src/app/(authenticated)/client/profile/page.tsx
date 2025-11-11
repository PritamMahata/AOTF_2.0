"use client";

import { useState, useEffect } from "react";
import { Button } from "@aotf/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import { Badge } from "@aotf/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aotf/ui/components/tabs";
import { Separator } from "@aotf/ui/components/separator";
import { Alert, AlertDescription } from "@aotf/ui/components/alert";
import { Textarea } from "@aotf/ui/components/textarea";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aotf/ui/components/select";
import {
  Camera,
  Save,
  MapPin,
  Edit,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Users,
  Copy,
  Check,
  Building,
  Globe,
} from "lucide-react";
import UserAvatar from "@aotf/ui/components/UserAvatar";
import { useToast } from "@aotf/ui/hooks/use-toast";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";

// Client interface
interface ClientProfile {
  role: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  address?: string;
  industry?: string;
  avatar?: string;
  bio?: string;
  totalJobsPosted?: number;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default client profile for fallback
const defaultClientProfile: ClientProfile = {
  role: "client",
  clientId: "",
  name: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  companyName: "",
  companyWebsite: "",
  address: "",
  industry: "",
  avatar: "",
  bio: "",
  totalJobsPosted: 0,
  rating: 0,
};

const industries = [
  "Technology",
  "Education",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Real Estate",
  "Other",
];

export default function ClientProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<ClientProfile>(
    defaultClientProfile
  );  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const { toast } = useToast();
  const mainAppOnboardingUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in'}/onboarding`;

  // Fetch client profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/client/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to main app if not authenticated
            const mainUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in';
            window.location.href = mainUrl;
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        if (data.success && data.client) {
          setUserProfile(data.client);
        } else {
          throw new Error(data.error || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [mainAppOnboardingUrl]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/client/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userProfile.name,
          phone: userProfile.phone,
          whatsappNumber: userProfile.whatsappNumber,
          companyName: userProfile.companyName,
          companyWebsite: userProfile.companyWebsite,
          address: userProfile.address,
          industry: userProfile.industry,
          bio: userProfile.bio,
          avatar: userProfile.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      if (data.success && data.client) {
        setUserProfile(data.client);
        setIsEditing(false);
        toast({
          title: "Success!",
          description: "Your profile has been updated successfully.",
          variant: "default",
        });
      } else {
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save profile";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyClientId = async () => {
    if (userProfile.clientId) {
      try {
        await navigator.clipboard.writeText(userProfile.clientId);
        setCopiedClientId(true);
        toast({
          title: "Copied!",
          description: "Client ID copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedClientId(false), 2000);
      } catch (err) {
        console.error("Failed to copy Client ID:", err);
        toast({
          title: "Error",
          description: "Failed to copy Client ID",
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6 flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error && !userProfile.name) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Unable to load profile data
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Success/Error Messages */}
          {error && userProfile.name && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Header Card */}
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                  <UserAvatar
                    name={userProfile.name}
                    src={userProfile.avatar}
                    size={140}
                    className="border-4 border-primary/10 shadow-xl"
                  />
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0 shadow-lg"
                      variant="default"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {/* Name and Actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-center md:text-left space-y-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        {userProfile.name}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <Badge variant="default" className="text-sm px-3 py-1">
                          Client
                        </Badge>
                        {userProfile.clientId && (
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="text-sm px-3 py-1"
                            >
                              ID: {userProfile.clientId}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={copyClientId}
                              title="Copy Client ID"
                            >
                              {copiedClientId ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        {userProfile.industry && (
                          <Badge
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            {userProfile.industry}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center md:justify-end">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                            size="lg"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                            className="min-w-[120px]"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          disabled={loading}
                          size="lg"
                          className="min-w-[140px]"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">
                          Email
                        </p>
                        <p className="text-sm font-medium truncate">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">
                          Phone
                        </p>
                        <p className="text-sm font-medium">
                          {userProfile.phone}
                        </p>
                      </div>
                    </div>

                    {userProfile.whatsappNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="p-2 rounded-full bg-green-100">
                          <Image
                            src="/whatsapp.svg"
                            alt="WhatsApp"
                            height={16}
                            width={16}
                            className="h-4 w-4 text-green-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            WhatsApp
                          </p>
                          <p className="text-sm font-medium">
                            {userProfile.whatsappNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {userProfile.address && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            Address
                          </p>
                          <p className="text-sm font-medium">
                            {userProfile.address}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {userProfile.companyName && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            Company
                          </p>
                          <p className="text-sm font-medium">
                            {userProfile.companyName}
                          </p>
                        </div>
                      </div>
                    )}

                    {userProfile.companyWebsite && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            Website
                          </p>
                          <p className="text-sm font-medium truncate">
                            {userProfile.companyWebsite}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {userProfile.bio && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Bio
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userProfile.bio}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="personal" className="text-base">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="account" className="text-base">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Contact Details
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={userProfile.name}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              name: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile.email}
                          disabled={true}
                          className="h-11 bg-muted/50"
                          placeholder="your.email@example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={userProfile.phone}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              phone: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="+91 1234567890"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label
                          htmlFor="whatsappNumber"
                          className="text-sm font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src="/whatsapp.svg"
                              alt="WhatsApp"
                              height={16}
                              width={16}
                              className="h-4 w-4 text-green-600"
                            />
                            WhatsApp Number
                          </div>
                        </Label>
                        <Input
                          id="whatsappNumber"
                          value={userProfile.whatsappNumber}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              whatsappNumber: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="+91 1234567890"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={userProfile.address}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              address: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="City, State, Country"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-medium">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={userProfile.companyName}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              companyName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="Your company name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite" className="text-sm font-medium">
                          Company Website
                        </Label>
                        <Input
                          id="companyWebsite"
                          value={userProfile.companyWebsite}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              companyWebsite: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-sm font-medium">
                          Industry
                        </Label>
                        <Select
                          value={userProfile.industry}
                          onValueChange={(value) =>
                            setUserProfile({
                              ...userProfile,
                              industry: value,
                            })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          value={userProfile.bio}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              bio: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="min-h-[100px]"
                          placeholder="Tell us about yourself or your company..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Password & Security
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Keep your account secure by updating your password regularly
                    </p>
                    <ChangePasswordDialog />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
