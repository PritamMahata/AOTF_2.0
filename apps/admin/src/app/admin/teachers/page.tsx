"use client";

import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@aotf/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@aotf/ui/components/dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { PermissionGuard } from "@/components/admin/permission-guard";

// Define the correct type for teacher data
interface AdminTeacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
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
  registrationFeeStatus: "pending" | "paid" | "failed";
  paymentVerifiedAt?: Date;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeachersManagement() {
  // Move hooks inside the component
  const [teachersData, setTeachersData] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  
  // Search and UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(
    null
  );
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true);
      try {
        // Build URL with pagination and search parameters
        const url = new URL('/api/teacher/get-all', window.location.origin);
        url.searchParams.set('page', currentPage.toString());
        url.searchParams.set('limit', limit.toString());
        if (searchTerm) {
          url.searchParams.set('search', searchTerm);
        }

        const res = await fetch(url.toString());
        const data = await res.json();
        setTeachersData(data.teachers || []);
        
        // Update pagination metadata
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
        
        console.log(data.teachers);
      } catch (err) {
        console.log("Error fetching teachers:", err);
        setTeachersData([]);
      }
      setLoading(false);
    }
    fetchTeachers();
  }, [currentPage, limit, searchTerm]);

  // Chart data derived from teachersData
  const verificationStatusData = [
    {
      name: "Pending",
      value: teachersData.filter((t) => t.registrationFeeStatus === "pending")
        .length,
      color: "#f59e0b",
    },
    {
      name: "Paid",
      value: teachersData.filter((t) => t.registrationFeeStatus === "paid")
        .length,
      color: "#10b981",
    },
    {
      name: "Failed",
      value: teachersData.filter((t) => t.registrationFeeStatus === "failed")
        .length,
      color: "#ef4444",
    },
  ];

  const subjectPopularityData = [
    {
      subject: "Mathematics",
      count: teachersData.filter((t) =>
        t.subjectsTeaching?.includes("Mathematics")
      ).length,
    },
    {
      subject: "Physics",
      count: teachersData.filter((t) => t.subjectsTeaching?.includes("Physics"))
        .length,
    },
    {
      subject: "Chemistry",
      count: teachersData.filter((t) =>
        t.subjectsTeaching?.includes("Chemistry")
      ).length,
    },
    {
      subject: "Biology",
      count: teachersData.filter((t) => t.subjectsTeaching?.includes("Biology"))
        .length,
    },
    {
      subject: "English",
      count: teachersData.filter((t) => t.subjectsTeaching?.includes("English"))
        .length,
    },
    {
      subject: "Computer Science",
      count: teachersData.filter((t) =>
        t.subjectsTeaching?.includes("Computer Science")
      ).length,
    },
  ];
  
  const filteredTeachers = teachersData; // Now handled by API

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  return (
    <PermissionGuard permission="teachers">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Teachers Management
            </h1>
            <p className="text-muted-foreground">
              Manage teacher registrations, verifications, and profiles
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCharts(!showCharts)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>
            {/* <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button> */}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by Teacher ID, name, email, location, phone, or qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Data Visualizations */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Fee Status</CardTitle>
                <CardDescription>
                  Distribution of teacher registration fee statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={verificationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {verificationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {verificationStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Popularity</CardTitle>
                <CardDescription>Number of teachers per subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={subjectPopularityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Teachers Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground text-lg">Loading teachers...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Teachers List</CardTitle>
              <CardDescription>
                Manage teacher accounts and verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Qualifications</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.teacherId}>
                      <TableCell className="font-medium">
                        {teacher.teacherId}
                      </TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{teacher.location}</TableCell>
                      <TableCell>{teacher.experience || "-"}</TableCell>
                      <TableCell>{teacher.qualifications || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjectsTeaching?.map((subject) => (
                            <Badge
                              key={subject}
                              variant="outline"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedTeacher(teacher)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Profile
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}              </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {teachersData.length > 0 ? ((currentPage - 1) * limit) + 1 : 0} to{" "}
                  {Math.min(currentPage * limit, totalCount)} of {totalCount} teachers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Teacher Details Dialog */}
        <Dialog
          open={!!selectedTeacher}
          onOpenChange={() => setSelectedTeacher(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected teacher
              </DialogDescription>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Teacher ID</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.teacherId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Experience</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.experience || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Qualifications</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.qualifications || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Subjects</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTeacher.subjectsTeaching?.map((subject) => (
                        <Badge key={subject} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
