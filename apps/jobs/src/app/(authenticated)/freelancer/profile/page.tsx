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
import { Textarea } from "@aotf/ui/components/textarea";
import { Badge } from "@aotf/ui/components/badge";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@aotf/ui/components/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aotf/ui/components/tabs";
import { Separator } from "@aotf/ui/components/separator";
import { Alert, AlertDescription } from "@aotf/ui/components/alert";
import {
  Camera,
  Save,
  MapPin,
  Clock,
  Edit,
  Mail,
  Phone,
  Loader2,
  BookOpen,
  Award,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import UserAvatar from "@aotf/ui/components/UserAvatar";
import { useToast } from "@aotf/ui/hooks/use-toast";
import Image from "next/image";
// import Link from "next/link";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";
// import Notification from "@/components/setting/Notification";

// Teacher interface
interface TeacherProfile {
  role: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  location: string;
  avatar?: string;
  experience?: string;
  qualifications?: string;
  subjects: string[];
  teachingMode?: string;
  bio?: string;
  hourlyRate?: string;
  availability?: string;
  rating?: number;
  totalGuardians?: number;
  teacherId?: string;
  registrationFeeStatus?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentVerifiedAt?: Date;
}

// Default teacher profile for fallback
const defaultTeacherProfile: TeacherProfile = {
  role: "teacher",
  name: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  location: "",
  avatar: "",
  experience: "",
  qualifications: "",
  subjects: [],
  teachingMode: "both",
  bio: "",
  hourlyRate: "",
  availability: "",
  rating: 0,
  totalGuardians: 0,
};

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Accounting",
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<TeacherProfile>(
    defaultTeacherProfile
  );
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTeacherId, setCopiedTeacherId] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  const { toast } = useToast();
  const mainAppOnboardingUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://aotf.in'}/onboarding`;

  // Fetch teacher profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/freelancer/profile", {
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
        if (data.success && data.teacher) {
          setUserProfile(data.teacher);
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

      const response = await fetch("/api/freelancer/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          whatsappNumber: userProfile.whatsappNumber,
          location: userProfile.location,
          experience: userProfile.experience,
          qualifications: userProfile.qualifications,
          subjectsTeaching: userProfile.subjects,
          teachingMode: userProfile.teachingMode,
          bio: userProfile.bio,
          hourlyRate: userProfile.hourlyRate,
          availability: userProfile.availability,
          avatar: userProfile.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      if (data.success && data.teacher) {
        setUserProfile(data.teacher);
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

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = userProfile.subjects;
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s: string) => s !== subject)
      : [...currentSubjects, subject];

    setUserProfile({
      ...userProfile,
      subjects: updatedSubjects,
    });
  };

  const copyTeacherId = async () => {
    if (userProfile.teacherId) {
      try {
        await navigator.clipboard.writeText(userProfile.teacherId);
        setCopiedTeacherId(true);
        toast({
          title: "Copied!",
          description: "Teacher ID copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedTeacherId(false), 2000);
      } catch (err) {
        console.log("Failed to copy Teacher ID:", err);
        toast({
          title: "Error",
          description: "Failed to copy Teacher ID",
          variant: "destructive",
        });
      }
    }
  };

  const copyPaymentId = async () => {
    if (userProfile.razorpayPaymentId) {
      try {
        await navigator.clipboard.writeText(userProfile.razorpayPaymentId);
        setCopiedPaymentId(true);
        toast({
          title: "Copied!",
          description: "Payment ID copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedPaymentId(false), 2000);
      } catch (err) {
        console.log("Failed to copy Payment ID:", err);
        toast({
          title: "Error",
          description: "Failed to copy Payment ID",
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
                      </h1>{" "}
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <Badge variant="default" className="text-sm px-3 py-1">
                          {userProfile.role}
                        </Badge>
                        {userProfile.teacherId && (
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="text-sm px-3 py-1"
                            >
                              TEACHER ID: {userProfile.teacherId}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={copyTeacherId}
                              title="Copy Teacher ID"
                            >
                              {copiedTeacherId ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        {userProfile.registrationFeeStatus === "paid" && (
                          <Badge
                            variant="secondary"
                            className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
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

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {userProfile.location}
                        </p>
                      </div>
                    </div>

                    {userProfile.availability && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">
                            Availability
                          </p>
                          <p className="text-sm font-medium">
                            {userProfile.availability}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Information */}
                  {(userProfile.razorpayPaymentId ||
                    userProfile.paymentVerifiedAt) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Payment Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {userProfile.razorpayPaymentId && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="p-2 rounded-full bg-blue-100">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Registration Payment ID
                                </p>
                                <p className="text-sm font-medium font-mono truncate">
                                  {userProfile.razorpayPaymentId}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={copyPaymentId}
                                title="Copy Payment ID"
                              >
                                {copiedPaymentId ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          )}
                          {userProfile.paymentVerifiedAt && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="p-2 rounded-full bg-green-100">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Verified On
                                </p>
                                <p className="text-sm font-medium">
                                  {new Date(
                                    userProfile.paymentVerifiedAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bio Section */}
                  {userProfile.bio && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          About
                        </h3>
                        <p className="text-sm text-foreground leading-relaxed">
                          {userProfile.bio}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Subjects */}
                  {userProfile.subjects.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Subjects
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.subjects.map((subject: string) => (
                            <Badge
                              key={subject}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {subject}
                            </Badge>
                          ))}
                        </div>
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
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="personal" className="text-base">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-base">
                Preferences
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
                      <Mail className="h-5 w-5 text-primary" />
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
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              email: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="your.email@example.com"
                        />
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
                        <p className="text-xs text-muted-foreground">
                          For quick communication with guardians
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium"
                        >
                          Location <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="location"
                          value={userProfile.location}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              location: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-11"
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                  </div>

                  {userProfile.role === "teacher" && (
                    <>
                      <Separator />

                      {/* Professional Details Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Professional Details
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="experience"
                              className="text-sm font-medium"
                            >
                              Teaching Experience
                            </Label>
                            <Input
                              id="experience"
                              value={userProfile.experience}
                              onChange={(e) =>
                                setUserProfile({
                                  ...userProfile,
                                  experience: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="h-11"
                              placeholder="e.g., 5 years"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="hourlyRate"
                              className="text-sm font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Hourly Compensation
                              </div>
                            </Label>
                            <Input
                              id="hourlyRate"
                              value={userProfile.hourlyRate}
                              onChange={(e) =>
                                setUserProfile({
                                  ...userProfile,
                                  hourlyRate: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="h-11"
                              placeholder="₹500/hour"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="qualifications"
                            className="text-sm font-medium"
                          >
                            Qualifications
                          </Label>
                          <Input
                            id="qualifications"
                            value={userProfile.qualifications}
                            onChange={(e) =>
                              setUserProfile({
                                ...userProfile,
                                qualifications: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className="h-11"
                            placeholder="e.g., B.Ed, M.Sc Mathematics"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="availability"
                            className="text-sm font-medium"
                          >
                            Availability
                          </Label>
                          <Input
                            id="availability"
                            value={userProfile.availability}
                            onChange={(e) =>
                              setUserProfile({
                                ...userProfile,
                                availability: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className="h-11"
                            placeholder="e.g., Mon-Fri, 2PM-8PM"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm font-medium">
                            Bio/Description
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
                            className="min-h-[120px] resize-none"
                            placeholder="Tell guardians about your teaching style, experience, and what makes you unique..."
                          />
                          <p className="text-xs text-muted-foreground">
                            This will be visible to guardians when they view
                            your profile
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">
                    Teaching Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage your teaching preferences and subjects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Subjects Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Subjects You Teach
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select all subjects you are qualified to teach
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjects.map((subject) => (
                        <div
                          key={subject}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                            userProfile.subjects.includes(subject)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${!isEditing ? "opacity-60" : "cursor-pointer"}`}
                        >
                          <Checkbox
                            id={subject}
                            checked={userProfile.subjects.includes(subject)}
                            onCheckedChange={() => handleSubjectToggle(subject)}
                            disabled={!isEditing}
                          />
                          <Label
                            htmlFor={subject}
                            className={`text-sm font-medium flex-1 ${
                              isEditing ? "cursor-pointer" : ""
                            }`}
                          >
                            {subject}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Teaching Mode Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold">
                        Teaching Mode Preference
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how you prefer to conduct your sessions
                      </p>
                    </div>
                    <RadioGroup
                      value={userProfile.teachingMode || ""}
                      onValueChange={(value) =>
                        setUserProfile({
                          ...userProfile,
                          teachingMode: value,
                        })
                      }
                      disabled={!isEditing}
                      className="grid gap-4"
                    >
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          userProfile.teachingMode === "online"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${!isEditing ? "opacity-60" : "cursor-pointer"}`}
                      >
                        <RadioGroupItem value="online" id="online" />
                        <Label
                          htmlFor="online"
                          className={`flex-1 ${
                            isEditing ? "cursor-pointer" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium">Online Sessions</p>
                            <p className="text-sm text-muted-foreground">
                              Teach students remotely via video calls
                            </p>
                          </div>
                        </Label>
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          userProfile.teachingMode === "in-person"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${!isEditing ? "opacity-60" : "cursor-pointer"}`}
                      >
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label
                          htmlFor="in-person"
                          className={`flex-1 ${
                            isEditing ? "cursor-pointer" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium">In-Person Sessions</p>
                            <p className="text-sm text-muted-foreground">
                              Meet students at their location or yours
                            </p>
                          </div>
                        </Label>
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          userProfile.teachingMode === "both"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${!isEditing ? "opacity-60" : "cursor-pointer"}`}
                      >
                        <RadioGroupItem value="both" id="both" />
                        <Label
                          htmlFor="both"
                          className={`flex-1 ${
                            isEditing ? "cursor-pointer" : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium">
                              Both Online & In-Person
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Flexible - offer both teaching modes
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
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
                      Keep your account secure by updating your password
                      regularly
                    </p>
                    <ChangePasswordDialog />
                  </div>
                  {/* <Notification userRole="teacher" /> */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
