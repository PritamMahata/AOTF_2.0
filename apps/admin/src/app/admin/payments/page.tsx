"use client";

import { useState } from "react";
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
import { PermissionGuard } from "@/components/admin/permission-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  CheckCircle,
  Bell,
  Download,
  Filter,
  DollarSign,
  Calendar,
  BarChart3,
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
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// Enhanced mock payments data
const paymentsData = [
  {
    id: "PAY001",
    teacherName: "Dr. Rajesh Kumar",
    teacherId: "TCH001",
    postId: "POST001",
    studentName: "Priya Sharma",
    paymentOption: "75% of 1st month",
    amount: 6000,
    totalSalary: 8000,
    paymentStatus: "paid",
    dueDate: "2024-02-15",
    paidDate: "2024-02-14",
    month: "January 2024",
    consultancyFee: 6000,
    paymentMethod: "Online Transfer",
    city: "Delhi",
  },
  {
    id: "PAY002",
    teacherName: "Priya Mehta",
    teacherId: "TCH002",
    postId: "POST002",
    studentName: "Rahul Kumar",
    paymentOption: "60% + 40% split",
    amount: 3600,
    totalSalary: 6000,
    paymentStatus: "pending",
    dueDate: "2024-03-20",
    paidDate: null,
    month: "February 2024",
    consultancyFee: 3600,
    paymentMethod: "UPI",
    city: "Mumbai",
  },
  {
    id: "PAY003",
    teacherName: "Sunita Sharma",
    teacherId: "TCH004",
    postId: "POST004",
    studentName: "Vikash Gupta",
    paymentOption: "75% of 1st month",
    amount: 5625,
    totalSalary: 7500,
    paymentStatus: "overdue",
    dueDate: "2024-03-05",
    paidDate: null,
    month: "February 2024",
    consultancyFee: 5625,
    paymentMethod: "Bank Transfer",
    city: "Chennai",
  },
  {
    id: "PAY004",
    teacherName: "Vikram Patel",
    teacherId: "TCH005",
    postId: "POST005",
    studentName: "Neha Patel",
    paymentOption: "60% + 40% split",
    amount: 3300,
    totalSalary: 5500,
    paymentStatus: "split_1st",
    dueDate: "2024-04-01",
    paidDate: "2024-03-28",
    month: "March 2024",
    consultancyFee: 3300,
    paymentMethod: "UPI",
    city: "Pune",
  },
  {
    id: "PAY005",
    teacherName: "Dr. Rajesh Kumar",
    teacherId: "TCH001",
    postId: "POST001",
    studentName: "Priya Sharma",
    paymentOption: "75% of 1st month",
    amount: 8000,
    totalSalary: 8000,
    paymentStatus: "paid",
    dueDate: "2024-03-15",
    paidDate: "2024-03-12",
    month: "February 2024",
    consultancyFee: 0,
    paymentMethod: "Online Transfer",
    city: "Delhi",
  },
  {
    id: "PAY006",
    teacherName: "Amit Singh",
    teacherId: "TCH006",
    postId: "POST006",
    studentName: "Arjun Mehta",
    paymentOption: "Full month salary",
    amount: 4500,
    totalSalary: 4500,
    paymentStatus: "paid",
    dueDate: "2024-03-10",
    paidDate: "2024-03-08",
    month: "March 2024",
    consultancyFee: 4500,
    paymentMethod: "UPI",
    city: "Bangalore",
  },
  {
    id: "PAY007",
    teacherName: "Neha Verma",
    teacherId: "TCH007",
    postId: "POST007",
    studentName: "Krishna Patel",
    paymentOption: "75% of 1st month",
    amount: 6750,
    totalSalary: 9000,
    paymentStatus: "pending",
    dueDate: "2024-04-05",
    paidDate: null,
    month: "March 2024",
    consultancyFee: 6750,
    paymentMethod: "Bank Transfer",
    city: "Hyderabad",
  },
  {
    id: "PAY008",
    teacherName: "Ravi Kumar",
    teacherId: "TCH008",
    postId: "POST008",
    studentName: "Sita Sharma",
    paymentOption: "60% + 40% split",
    amount: 4200,
    totalSalary: 7000,
    paymentStatus: "overdue",
    dueDate: "2024-03-25",
    paidDate: null,
    month: "March 2024",
    consultancyFee: 4200,
    paymentMethod: "UPI",
    city: "Delhi",
  },
];

// Chart data derived from payments data
const paymentStatusData = [
  {
    name: "Paid",
    value: paymentsData.filter((p) => p.paymentStatus === "paid").length,
    color: "#10b981",
  },
  {
    name: "Pending",
    value: paymentsData.filter((p) => p.paymentStatus === "pending").length,
    color: "#f59e0b",
  },
  {
    name: "Overdue",
    value: paymentsData.filter((p) => p.paymentStatus === "overdue").length,
    color: "#ef4444",
  },
  {
    name: "Split 1st",
    value: paymentsData.filter((p) => p.paymentStatus === "split_1st").length,
    color: "#8b5cf6",
  },
];

const monthlyRevenueData = [
  { month: "Jan", revenue: 6000, pending: 0, overdue: 0 },
  { month: "Feb", revenue: 11600, pending: 3600, overdue: 5625 },
  { month: "Mar", revenue: 15800, pending: 10450, overdue: 4200 },
  { month: "Apr", revenue: 0, pending: 6750, overdue: 0 },
];

const paymentMethodData = [
  {
    method: "UPI",
    count: paymentsData.filter((p) => p.paymentMethod === "UPI").length,
    amount: paymentsData
      .filter((p) => p.paymentMethod === "UPI")
      .reduce((sum, p) => sum + p.amount, 0),
  },
  {
    method: "Online Transfer",
    count: paymentsData.filter((p) => p.paymentMethod === "Online Transfer")
      .length,
    amount: paymentsData
      .filter((p) => p.paymentMethod === "Online Transfer")
      .reduce((sum, p) => sum + p.amount, 0),
  },
  {
    method: "Bank Transfer",
    count: paymentsData.filter((p) => p.paymentMethod === "Bank Transfer")
      .length,
    amount: paymentsData
      .filter((p) => p.paymentMethod === "Bank Transfer")
      .reduce((sum, p) => sum + p.amount, 0),
  },
];

const cityRevenueData = [
  { city: "Delhi", revenue: 14000, pending: 4200, teachers: 2 },
  { city: "Mumbai", revenue: 3600, pending: 3600, teachers: 1 },
  { city: "Chennai", revenue: 5625, pending: 0, teachers: 1 },
  { city: "Pune", revenue: 3300, pending: 0, teachers: 1 },
  { city: "Bangalore", revenue: 4500, pending: 0, teachers: 1 },
  { city: "Hyderabad", revenue: 0, pending: 6750, teachers: 1 },
];

const teacherPerformanceData = [
  {
    teacher: "Dr. Rajesh Kumar",
    totalEarnings: 14000,
    completedPayments: 2,
    pendingAmount: 0,
    city: "Delhi",
  },
  {
    teacher: "Priya Mehta",
    totalEarnings: 3600,
    completedPayments: 0,
    pendingAmount: 3600,
    city: "Mumbai",
  },
  {
    teacher: "Sunita Sharma",
    totalEarnings: 5625,
    completedPayments: 0,
    pendingAmount: 5625,
    city: "Chennai",
  },
  {
    teacher: "Vikram Patel",
    totalEarnings: 3300,
    completedPayments: 1,
    pendingAmount: 0,
    city: "Pune",
  },
  {
    teacher: "Amit Singh",
    totalEarnings: 4500,
    completedPayments: 1,
    pendingAmount: 0,
    city: "Bangalore",
  },
  {
    teacher: "Neha Verma",
    totalEarnings: 0,
    completedPayments: 0,
    pendingAmount: 6750,
    city: "Hyderabad",
  },
  {
    teacher: "Ravi Kumar",
    totalEarnings: 0,
    completedPayments: 0,
    pendingAmount: 4200,
    city: "Delhi",
  },
];

const weeklyPaymentTrends = [
  { week: "Week 1", payments: 2, amount: 12000, status: "completed" },
  { week: "Week 2", payments: 1, amount: 4500, status: "completed" },
  { week: "Week 3", payments: 2, amount: 11300, status: "completed" },
  { week: "Week 4", payments: 1, amount: 3300, status: "completed" },
  { week: "Week 5", payments: 0, amount: 0, status: "pending" },
  { week: "Week 6", payments: 0, amount: 0, status: "pending" },
];

export default function PaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<
    (typeof paymentsData)[0] | null
  >(null);
  const [showCharts, setShowCharts] = useState(false);

  const filteredPayments = paymentsData.filter(
    (payment) =>
      payment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.postId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePaymentAction = (action: string, paymentId: string) => {
    console.log(`${action} action for payment ${paymentId}`);
    // TODO: Implement actual payment actions
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      case "split_1st":
        return "outline";
      default:
        return "secondary";
    }
  };

  const totalRevenue = paymentsData.reduce(
    (sum, p) => sum + p.consultancyFee,
    0
  );
  const pendingAmount = paymentsData
    .filter((p) => p.paymentStatus === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <PermissionGuard permission="payments">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Payments Management
            </h1>
            <p className="text-muted-foreground">
              Track consultancy payments and teacher compensation
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowCharts(!showCharts)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {paymentsData.length}</span>
          <span>
            Paid:{" "}
            {paymentsData.filter((p) => p.paymentStatus === "paid").length}
          </span>
          <span>
            Pending:{" "}
            {paymentsData.filter((p) => p.paymentStatus === "pending").length}
          </span>
          <span>
            Overdue:{" "}
            {paymentsData.filter((p) => p.paymentStatus === "overdue").length}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-wrap">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From consultancy fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <div className="flex flex-row gap-4 m-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teacher</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{pendingAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting collection
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Guardian</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{pendingAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting collection
                </p>
              </CardContent>
            </Card>
          </div>
        </Card>
      </div>

      {/* Data Visualizations */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
              <CardDescription>Breakdown of payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {paymentStatusData.map((item) => (
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

          {/* Monthly Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>
                Revenue, pending, and overdue amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#0ea5e9"
                    name="Number of Payments"
                  />
                  <Bar
                    dataKey="amount"
                    fill="#8b5cf6"
                    name="Total Amount (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* City-wise Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>City-wise Revenue Performance</CardTitle>
              <CardDescription>
                Revenue and pending amounts by city
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cityRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                  <Bar dataKey="pending" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Teacher Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Payment Performance</CardTitle>
              <CardDescription>
                Earnings and payment status by teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={teacherPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="teacher" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalEarnings" fill="#0ea5e9" />
                  <Bar dataKey="pendingAmount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Payment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Payment Trends</CardTitle>
              <CardDescription>Payment activity over weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyPaymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="payments"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Records</CardTitle>
          <CardDescription>
            Consultancy payment tracking and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Post ID</TableHead>
                <TableHead>Payment Option</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.teacherName}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.teacherId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.postId}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.studentName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{payment.paymentOption}</TableCell>
                  <TableCell className="font-medium">
                    ₹{payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(payment.paymentStatus)}>
                      {payment.paymentStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.dueDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {payment.paymentStatus !== "paid" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handlePaymentAction("mark-paid", payment.id)
                            }
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            handlePaymentAction("send-reminder", payment.id)
                          }
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePaymentAction("export-report", payment.id)
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete payment information and history
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment ID</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.id}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.month}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.teacherName} ({selectedPayment.teacherId})
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Student</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.studentName}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Post ID</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.postId}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Salary</label>
                <p className="text-sm text-muted-foreground">
                  ₹{selectedPayment.totalSalary.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Option</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.paymentOption}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Consultancy Fee</label>
                <p className="text-sm text-muted-foreground">
                  ₹{selectedPayment.consultancyFee.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.dueDate}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Paid Date</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.paidDate || "Not paid yet"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Badge variant={getStatusColor(selectedPayment.paymentStatus)}>
                  {selectedPayment.paymentStatus.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Due</label>
                <p className="text-sm text-muted-foreground font-medium">
                  ₹{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.paymentMethod}
                </p>
              </div>              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPayment.city}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  );
}
