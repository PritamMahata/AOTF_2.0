"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aotf/ui/components/card";
import { Badge } from "@aotf/ui/components/badge";
import { Button } from "@aotf/ui/components/button";
import {
  Users,
  GraduationCap,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Calendar,
  Target,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Line,
  ResponsiveContainer,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import React from "react";
import { PermissionGuard } from "@/components/admin/permission-guard";

// Enhanced mock data for dashboard
const statsData = {
  totalStudents: 1247,
  totalTeachers: 892,
  activePosts: 156,
  pendingVerifications: 23,
  totalRevenue: 45600,
  completedApplications: 89,
  monthlyGrowth: 12.5,
  conversionRate: 68.3,
};

const postStatusData = [
  { name: "Active", value: 156, color: "#0ea5e9" },
  { name: "Assigned", value: 89, color: "#10b981" },
  { name: "Closed", value: 234, color: "#6b7280" },
  { name: "Expired", value: 45, color: "#f59e0b" },
  { name: "Draft", value: 12, color: "#8b5cf6" },
];

const monthlyData = [
  {
    month: "Jan",
    students: 45,
    teachers: 32,
    posts: 67,
    revenue: 3200,
    applications: 23,
  },
  {
    month: "Feb",
    students: 52,
    teachers: 41,
    posts: 78,
    revenue: 3800,
    applications: 28,
  },
  {
    month: "Mar",
    students: 48,
    teachers: 38,
    posts: 82,
    revenue: 4200,
    applications: 31,
  },
  {
    month: "Apr",
    students: 61,
    teachers: 45,
    posts: 95,
    revenue: 4800,
    applications: 35,
  },
  {
    month: "May",
    students: 55,
    teachers: 42,
    posts: 88,
    revenue: 4500,
    applications: 33,
  },
  {
    month: "Jun",
    students: 67,
    teachers: 51,
    posts: 102,
    revenue: 5200,
    applications: 38,
  },
  {
    month: "Jul",
    students: 73,
    teachers: 58,
    posts: 115,
    revenue: 5800,
    applications: 42,
  },
  {
    month: "Aug",
    students: 68,
    teachers: 55,
    posts: 108,
    revenue: 5400,
    applications: 40,
  },
];

const subjectDistribution = [
  {
    subject: "Mathematics",
    students: 45,
    teachers: 32,
    posts: 67,
    demand: "High",
  },
  { subject: "Physics", students: 38, teachers: 28, posts: 52, demand: "High" },
  {
    subject: "Chemistry",
    students: 35,
    teachers: 25,
    posts: 48,
    demand: "Medium",
  },
  { subject: "Biology", students: 42, teachers: 30, posts: 55, demand: "High" },
  {
    subject: "English",
    students: 28,
    teachers: 22,
    posts: 35,
    demand: "Medium",
  },
  {
    subject: "Computer Science",
    students: 25,
    teachers: 18,
    posts: 28,
    demand: "Low",
  },
];

const locationData = [
  { city: "Delhi", students: 156, teachers: 98, posts: 89, revenue: 8900 },
  { city: "Mumbai", students: 134, teachers: 87, posts: 76, revenue: 7600 },
  { city: "Bangalore", students: 98, teachers: 65, posts: 54, revenue: 5400 },
  { city: "Chennai", students: 87, teachers: 54, posts: 43, revenue: 4300 },
  { city: "Pune", students: 76, teachers: 48, posts: 38, revenue: 3800 },
  { city: "Hyderabad", students: 65, teachers: 42, posts: 32, revenue: 3200 },
];

const performanceMetrics = [
  { metric: "Response Time", value: 85, target: 90, unit: "ms" },
  { metric: "Success Rate", value: 92, target: 95, unit: "%" },
  { metric: "User Satisfaction", value: 88, target: 90, unit: "/10" },
  { metric: "Platform Uptime", value: 99.2, target: 99.5, unit: "%" },
  { metric: "Conversion Rate", value: 68.3, target: 75, unit: "%" },
];

const recentActivities = [
  {
    id: 1,
    type: "verification",
    message: "Teacher verification pending for Rajesh Kumar",
    time: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    type: "application",
    message: "New application submitted for Math tuition in Delhi",
    time: "4 hours ago",
    status: "new",
  },
  {
    id: 3,
    type: "payment",
    message: "Payment received from Priya Sharma (₹2,400)",
    time: "6 hours ago",
    status: "completed",
  },
  {
    id: 4,
    type: "post",
    message: "New tuition post created for Class 12 Physics",
    time: "8 hours ago",
    status: "active",
  },
  {
    id: 5,
    type: "user",
    message: "New teacher registration: Amit Singh",
    time: "1 day ago",
    status: "new",
  },
];

const heatmapData = [
  { day: "Mon", "9AM": 12, "12PM": 25, "3PM": 18, "6PM": 32, "9PM": 15 },
  { day: "Tue", "9AM": 15, "12PM": 28, "3PM": 22, "6PM": 35, "9PM": 18 },
  { day: "Wed", "9AM": 18, "12PM": 32, "3PM": 25, "6PM": 38, "9PM": 20 },
  { day: "Thu", "9AM": 14, "12PM": 26, "3PM": 20, "6PM": 33, "9PM": 16 },
  { day: "Fri", "9AM": 20, "12PM": 35, "3PM": 28, "6PM": 42, "9PM": 22 },
  { day: "Sat", "9AM": 25, "12PM": 45, "3PM": 35, "6PM": 50, "9PM": 30 },
  { day: "Sun", "9AM": 30, "12PM": 50, "3PM": 40, "6PM": 55, "9PM": 35 },
];

export default function AdminDashboard() {
  return (
    <PermissionGuard permission="dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive overview of AOT Tuition Services platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button>
              <Activity className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Teachers
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData.totalTeachers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Posts
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.activePosts}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+15</span> new today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verifications
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statsData.pendingVerifications}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{statsData.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsData.completedApplications}
              </div>
              <p className="text-xs text-muted-foreground">Applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsData.monthlyGrowth}%
              </div>
              <p className="text-xs text-muted-foreground">Monthly growth</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statsData.conversionRate}%
              </div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tuition Posts Status</CardTitle>
              <CardDescription>Distribution of post statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={postStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {postStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {postStatusData.map((item) => (
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

          {/* Monthly Growth with Composed Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Growth Trends</CardTitle>
              <CardDescription>
                Students, teachers, and posts over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    stroke="#8b5cf6"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="students"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="teachers"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="posts"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* New Advanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Distribution</CardTitle>
              <CardDescription>
                Students, teachers, and posts by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#0ea5e9" />
                  <Bar dataKey="teachers" fill="#10b981" />
                  <Bar dataKey="posts" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Performance */}
          <Card>
            <CardHeader>
              <CardTitle>City-wise Performance</CardTitle>
              <CardDescription>
                Revenue and activity by location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
                  <Bar dataKey="posts" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Platform performance against targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar
                  name="Current"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Heatmap</CardTitle>
            <CardDescription>Platform activity by day and time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-1 min-w-[600px]">
                <div className="text-sm font-medium text-center p-2">Day</div>
                <div className="text-sm font-medium text-center p-2">9AM</div>
                <div className="text-sm font-medium text-center p-2">12PM</div>
                <div className="text-sm font-medium text-center p-2">3PM</div>
                <div className="text-sm font-medium text-center p-2">6PM</div>
                <div className="text-sm font-medium text-center p-2">9PM</div>

                {heatmapData.map((row) => (
                  <React.Fragment key={row.day}>
                    <div className="text-sm font-medium p-2">{row.day}</div>
                    <div
                      className="text-xs p-2 text-center"
                      style={{
                        backgroundColor: `rgba(14, 165, 233, ${
                          row["9AM"] / 50
                        })`,
                        color: row["9AM"] > 25 ? "white" : "black",
                      }}
                    >
                      {row["9AM"]}
                    </div>
                    <div
                      className="text-xs p-2 text-center"
                      style={{
                        backgroundColor: `rgba(14, 165, 233, ${
                          row["12PM"] / 50
                        })`,
                        color: row["12PM"] > 25 ? "white" : "black",
                      }}
                    >
                      {row["12PM"]}
                    </div>
                    <div
                      className="text-xs p-2 text-center"
                      style={{
                        backgroundColor: `rgba(14, 165, 233, ${
                          row["3PM"] / 50
                        })`,
                        color: row["3PM"] > 25 ? "white" : "black",
                      }}
                    >
                      {row["3PM"]}
                    </div>
                    <div
                      className="text-xs p-2 text-center"
                      style={{
                        backgroundColor: `rgba(14, 165, 233, ${
                          row["6PM"] / 50
                        })`,
                        color: row["6PM"] > 25 ? "white" : "black",
                      }}
                    >
                      {row["6PM"]}
                    </div>
                    <div
                      className="text-xs p-2 text-center"
                      style={{
                        backgroundColor: `rgba(14, 165, 233, ${
                          row["9PM"] / 50
                        })`,
                        color: row["9PM"] > 25 ? "white" : "black",
                      }}
                    >
                      {row["9PM"]}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest platform activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="shrink-0">
                    {activity.type === "verification" && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {activity.type === "application" && (
                      <FileText className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.type === "payment" && (
                      <DollarSign className="h-5 w-5 text-green-500" />
                    )}
                    {activity.type === "post" && (
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    )}
                    {activity.type === "user" && (
                      <Users className="h-5 w-5 text-cyan-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "pending"
                        ? "secondary"
                        : activity.status === "completed"
                        ? "default"
                        : activity.status === "new"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
