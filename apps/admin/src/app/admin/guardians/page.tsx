"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card"
import { Button } from "@aotf/ui/components/button"
import { Input } from "@aotf/ui/components/input"
import { Badge } from "@aotf/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@aotf/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aotf/ui/components/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@aotf/ui/components/dialog"
import { Search, MoreHorizontal, Eye, Filter, BarChart3, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts"
import { PermissionGuard } from "@/components/admin/permission-guard"

// Guardian interface matching the model
interface Guardian {
  guardianId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  grade?: string;
  subjectsOfInterest?: string[];
  learningMode?: string;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [guardiansData, setGuardiansData] = useState<Guardian[]>([])
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null)
  const [showCharts, setShowCharts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  useEffect(() => {
    async function fetchGuardians() {
      setLoading(true)
      setError("")
      try {
        // Build URL with pagination and search parameters
        const url = new URL('/api/guardian/get-all', window.location.origin);
        url.searchParams.set('page', currentPage.toString());
        url.searchParams.set('limit', limit.toString());
        if (searchTerm) {
          url.searchParams.set('search', searchTerm);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch guardians")
        const data = await res.json()
        setGuardiansData(data.guardians || [])
        
        // Update pagination metadata
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
          setTotalCount(data.pagination.totalCount)
        }
        
        console.log(data)  //response data for debugging
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error fetching guardians")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGuardians()
}, [currentPage, limit, searchTerm])

  // Filtered guardians - now handled by API
  const filteredGuardians = guardiansData;

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1)
    }
  }, [searchTerm])

  // Chart data derived from guardiansData
  const learningModeDistributionData = [
    { name: "Online", value: guardiansData.filter(g => g.learningMode === "online").length, color: "#0ea5e9" },
    { name: "In-person", value: guardiansData.filter(g => g.learningMode === "in-person").length, color: "#10b981" },
    { name: "Both", value: guardiansData.filter(g => g.learningMode === "both").length, color: "#f59e0b" },
  ]

  const gradeDistributionData = Array.from(new Set(guardiansData.map(g => g.grade).filter(Boolean))).map(grade => ({
    grade,
    count: guardiansData.filter(g => g.grade === grade).length
  }))

  const subjectPopularityData = Array.from(new Set(guardiansData.flatMap(g => g.subjectsOfInterest || []))).map(subject => ({
    subject,
    count: guardiansData.filter(g => (g.subjectsOfInterest || []).includes(subject)).length
  }))

  const locationDistributionData = Array.from(new Set(guardiansData.map(g => g.location))).map(location => ({
    location,
    count: guardiansData.filter(g => g.location === location).length
  }))

  // Monthly registrations (by createdAt)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyRegistrations = monthNames.map((month, i) => {
    const count = guardiansData.filter(g => new Date(g.createdAt).getMonth() === i).length
    return { month, newGuardians: count }
  })

  return (
    <PermissionGuard permission="guardians">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guardians Management</h1>
            <p className="text-muted-foreground">Manage guardian accounts and interests</p>
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
              placeholder="Search by Guardian ID, name, email, location, phone, or grade..."
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

        {/* Loading/Error States */}
        {loading && <div className="text-center py-8 text-muted-foreground">Loading guardians...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        {/* Data Visualizations */}
        {showCharts && !loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Mode Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Mode</CardTitle>
                <CardDescription>Distribution of preferred learning modes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={learningModeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {learningModeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Guardians by grade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Preferences</CardTitle>
                <CardDescription>Most popular subjects among guardians</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={subjectPopularityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Guardians by city</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={locationDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Registrations</CardTitle>
                <CardDescription>New guardians registered per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="newGuardians" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Guardians Table */}
        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Guardians List</CardTitle>
              <CardDescription>Manage guardian accounts and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guardian ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>WhatsApp Number</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuardians.map((guardian) => (
                    <TableRow key={guardian.guardianId}>
                      <TableCell className="font-medium">{guardian.guardianId}</TableCell>
                      <TableCell>{guardian.name}</TableCell>
                      <TableCell>{guardian.email}</TableCell>
                      <TableCell>{guardian.phone}</TableCell>
                      <TableCell>{guardian.location}</TableCell>
                      <TableCell>{guardian.whatsappNumber || "-"}</TableCell>
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
                            <DropdownMenuItem onClick={() => setSelectedGuardian(guardian)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <BookOpen className="mr-2 h-4 w-4" />
                              View Posts
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}              </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {guardiansData.length > 0 ? ((currentPage - 1) * limit) + 1 : 0} to{" "}
                  {Math.min(currentPage * limit, totalCount)} of {totalCount} guardians
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

        {/* Guardian Details Dialog */}
        <Dialog open={!!selectedGuardian} onOpenChange={() => setSelectedGuardian(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Guardian Details</DialogTitle>
              <DialogDescription>Complete information about the selected guardian</DialogDescription>
            </DialogHeader>
            {selectedGuardian && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Guardian ID</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.guardianId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Grade</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.grade || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Learning Mode</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.learningMode || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">WhatsApp Number</label>
                    <p className="text-sm text-muted-foreground">{selectedGuardian.whatsappNumber || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Subjects of Interest</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedGuardian.subjectsOfInterest || []).map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created At</label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedGuardian.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Updated At</label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedGuardian.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
