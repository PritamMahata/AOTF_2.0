"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card"
import { Button } from "@aotf/ui/components/button"
import { Input } from "@aotf/ui/components/input"
import { Label } from "@aotf/ui/components/label"
import { Switch } from "@aotf/ui/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aotf/ui/components/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aotf/ui/components/select"
import { Badge } from "@aotf/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@aotf/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aotf/ui/components/dialog"
import { Settings, Plus, Edit, Trash2 } from "lucide-react"
import { PermissionGuard } from "@/components/admin/permission-guard"

// Mock admin accounts data
const adminAccounts = [
  {
    id: "ADM001",
    name: "Super Admin",
    email: "admin@aottuition.com",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-03-16 10:30 AM",
  },
  {
    id: "ADM002",
    name: "Content Manager",
    email: "content@aottuition.com",
    role: "content_admin",
    status: "active",
    lastLogin: "2024-03-15 02:15 PM",
  },
  {
    id: "ADM003",
    name: "Support Admin",
    email: "support@aottuition.com",
    role: "support_admin",
    status: "inactive",
    lastLogin: "2024-03-10 09:45 AM",
  },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: "AOT Tuition Services",
    supportEmail: "support@aottuition.com",
    maxPostsPerStudent: "5",
    maxApplicationPerPost: "3", // <-- Add this line
    teacherVerificationRequired: true,
    autoApproveApplications: false,
    emailNotifications: true,
    whatsappNotifications: true,
    maintenanceMode: false,
    consultancyOption1: "75",
    consultancyOption2First: "60",
    consultancyOption2Second: "40",
  })

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "content_admin",
  })

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSaveSettings = async () => {
    try {
      // Send settings to backend API
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      // Optionally show a success message
      alert("Settings saved successfully!");
    } catch {
      alert("Failed to save settings");
    }
  }

  const handleAddAdmin = () => {
    console.log("Adding new admin:", newAdmin)    // TODO: Implement actual admin creation
    setNewAdmin({ name: "", email: "", role: "content_admin" })
  }

  return (
    <PermissionGuard permission="settings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
            <p className="text-muted-foreground">Manage platform settings and admin accounts</p>
          </div>
          <Button onClick={handleSaveSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="consultancy">Consultancy</TabsTrigger>
          <TabsTrigger value="admins">Admin Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange("platformName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange("supportEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPosts">Max Posts Per Student</Label>
                <Select
                  value={settings.maxPostsPerStudent}
                  onValueChange={(value) => handleSettingChange("maxPostsPerStudent", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Posts</SelectItem>
                    <SelectItem value="5">5 Posts</SelectItem>
                    <SelectItem value="10">10 Posts</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxApplications">Max Applications Per Post</Label>
                <Select
                  value={settings.maxApplicationPerPost}
                  onValueChange={(value) => handleSettingChange("maxApplicationPerPost", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Application</SelectItem>
                    <SelectItem value="2">2 Applications</SelectItem>
                    <SelectItem value="3">3 Applications</SelectItem>
                    <SelectItem value="5">5 Applications</SelectItem>
                    <SelectItem value="10">10 Applications</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>WhatsApp Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via WhatsApp</p>
                </div>
                <Switch
                  checked={settings.whatsappNotifications}
                  onCheckedChange={(checked) => handleSettingChange("whatsappNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultancy Terms</CardTitle>
              <CardDescription>Configure payment options for teachers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Option 1: Single Payment</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.consultancyOption1}
                    onChange={(e) => handleSettingChange("consultancyOption1", e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% of 1st month salary</span>
                </div>
                <p className="text-xs text-muted-foreground">Teacher keeps full salary from 2nd month onwards</p>
              </div>

              <div className="space-y-2">
                <Label>Option 2: Split Payment</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.consultancyOption2First}
                    onChange={(e) => handleSettingChange("consultancyOption2First", e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% of 1st month +</span>
                  <Input
                    type="number"
                    value={settings.consultancyOption2Second}
                    onChange={(e) => handleSettingChange("consultancyOption2Second", e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% of 2nd month</span>
                </div>
                <p className="text-xs text-muted-foreground">Teacher keeps full salary from 3rd month onwards</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Accounts</CardTitle>
                  <CardDescription>Manage administrator access</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                      <DialogDescription>Create a new administrator account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">Name</Label>
                        <Input
                          id="adminName"
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminRole">Role</Label>
                        <Select
                          value={newAdmin.role || ""}
                          onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="content_admin">Content Admin</SelectItem>
                            <SelectItem value="support_admin">Support Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddAdmin} className="w-full">
                        Create Admin Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminAccounts.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.id}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{admin.role.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{admin.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">                          <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PermissionGuard>
  )
}
