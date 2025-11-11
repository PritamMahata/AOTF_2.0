"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@aotf/ui/components/Card";
import { Button } from "@aotf/ui/components/button";
import { Input } from "@aotf/ui/components/input";
import { Label } from "@aotf/ui/components/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@aotf/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@aotf/ui/components/dialog";
import { Badge } from "@aotf/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aotf/ui/components/tabs";
import Image from "next/image";
import { BarChart, Eye, MousePointer, TrendingUp, RefreshCw, Clock } from "lucide-react";
import { PermissionGuard } from "@/components/admin/permission-guard";

interface Ad {
  id?: string;
  _id?: string;
  title: string;
  imageUrl: string;
  link: string;
  status: "active" | "inactive" | "expired" | "scheduled";
  startDate?: string;
  endDate?: string;
  impressions?: number;
  clicks?: number;
}

interface AnalyticsData {
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    totalAds: number;
    activeAds: number;
  };
  ads: Array<{
    _id: string;
    title: string;
    status: string;
    impressions: number;
    clicks: number;
    ctr: number;
    startDate?: string;
    endDate?: string;
  }>;
}

export default function AdManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<Partial<Ad>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("management");
  const [serverTime, setServerTime] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // Fetch server time on mount and refresh every 30 seconds
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await fetch("/api/ad/sync-status");
        const data = await res.json();
        if (data.success) {
          setServerTime(data.serverTime);
        }
      } catch (error) {
        console.error("Failed to fetch server time:", error);
      }
    };

    // Fetch immediately on mount
    fetchServerTime();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchServerTime, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Rest of the component logic...

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ad/manage");
      const data = await res.json();
      if (data.success) setAds(data.ads);
      else setError(data.error || "Failed to fetch ads");
    } catch {
      setError("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ad/analytics");
      const data = await res.json();
      if (data.success) setAnalytics(data);
      else setError(data.error || "Failed to fetch analytics");
    } catch {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const syncAdStatuses = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/ad/sync-status");
      const data = await res.json();
      if (data.success) {
        setServerTime(data.serverTime);
        setSyncSuccess(data.message);
        // Refresh the ads list to show updated statuses
        await fetchAds();
        // Clear success message after 3 seconds
        setTimeout(() => setSyncSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to sync ad statuses");
      }
    } catch {
      setError("Failed to sync ad statuses");
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenDialog = (ad?: Ad) => {
    setShowDialog(true);
    if (ad) {
      setForm({
        ...ad,
        startDate: ad.startDate
          ? new Date(ad.startDate).toISOString().split("T")[0]
          : "",
        endDate: ad.endDate
          ? new Date(ad.endDate).toISOString().split("T")[0]
          : "",
      });
      setEditId(ad.id || ad._id || "");
    } else {
      setForm({
        title: "",
        imageUrl: "",
        link: "",
        status: "active",
        startDate: "",
        endDate: ""
      }); // Set all fields to empty/default
      setEditId(null);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setForm({});
    setEditId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    console.log("inside handleSave", form);
    if (
      !form.title?.trim() ||
      !form.imageUrl?.trim() ||
      !form.link?.trim() ||
      !form.status?.trim()
    ) {
      setError("All required fields must be filled.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      console.log("inside try block", form);
      let res; 
      
      if (editId) {
        res = await fetch("/api/ad/manage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
        console.log("after fetch call", res);
        
      } else {
        res = await fetch("/api/ad/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (data.success) {
        await fetchAds();
        handleCloseDialog();
      } else {
        setError(data.error || "Failed to save ad");
      }
    } catch {
      setError("Failed to save ad");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ad/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setAds(ads.filter((ad) => (ad.id || ad._id) !== id));
      } else {
        setError(data.error || "Failed to delete ad");
      }
    } catch{
      setError("Failed to delete ad");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();  };

  return (
    <PermissionGuard permission="ads">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ad Management</h1>
            <p className="text-muted-foreground">
              Manage promotional banners and track ad performance
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button 
              variant="outline" 
              onClick={syncAdStatuses}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Status'}
            </Button>
            <Button onClick={() => handleOpenDialog()}>Add New Ad</Button>
        </div>
      </div>

      {/* Server Time Display - Always Visible */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Server Time:
            </span>
            {serverTime ? (
              <>
                <span className="text-blue-700 dark:text-blue-300">
                  {new Date(serverTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                    hour12: true
                  })}
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs ml-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Auto-updates every 30s
                </span>
              </>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 animate-pulse">
                Loading...
              </span>
            )}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
            All ad scheduling is based on server time, not your local time
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      {syncSuccess && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">{syncSuccess}</div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="management">Ad Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          {/* Info Card */}
          <Card className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automatic Ad Scheduling (Server Time)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">📅 Status Types:</p>
                  <ul className="space-y-1 ml-4">
                    <li><Badge variant="default">Active</Badge> - Currently displayed to users</li>
                    <li><Badge variant="secondary">Scheduled</Badge> - Will activate on start date</li>
                    <li><Badge variant="destructive">Expired</Badge> - End date has passed</li>
                    <li><Badge variant="outline">Inactive</Badge> - Manually disabled</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">⚡ Auto-Updates:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>✓ Ads auto-activate when start date arrives</li>
                    <li>✓ Ads auto-expire when end date passes</li>
                    <li>✓ All timing based on server time (not client)</li>
                    <li>✓ Status syncs on every page load & manual sync</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Ads</CardTitle>
              <CardDescription>
                Active, inactive, and expired ads displayed on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.map((ad) => (
                        <TableRow key={ad.id || ad._id}>
                          <TableCell className="font-medium">
                            {ad.title}
                          </TableCell>
                          <TableCell>
                            <Image
                              src={ad.imageUrl}
                              alt={ad.title}
                              width={60}
                              height={40}
                              className="object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ad.status === "active"
                                  ? "default"
                                  : ad.status === "expired"
                                  ? "destructive"
                                  : ad.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {ad.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ad.startDate)}</TableCell>
                          <TableCell>{formatDate(ad.endDate)}</TableCell>
                          <TableCell>{ad.impressions || 0}</TableCell>
                          <TableCell>{ad.clicks || 0}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(ad)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDelete(ad.id || ad._id || "")
                              }
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {ads.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-muted-foreground py-8"
                          >
                            No ads found. Create your first ad to get started!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Impressions
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totals.impressions.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Clicks
                    </CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totals.clicks.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average CTR
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totals.ctr.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Ads
                    </CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totals.activeAds} / {analytics.totals.totalAds}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Ad Performance</CardTitle>
                  <CardDescription>
                    Detailed metrics for each advertisement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.ads.map((ad) => (
                        <TableRow key={ad._id}>
                          <TableCell className="font-medium">
                            {ad.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ad.status === "active"
                                  ? "default"
                                  : ad.status === "expired"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {ad.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ad.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                          <TableCell>{ad.ctr.toFixed(2)}%</TableCell>
                          <TableCell>{formatDate(ad.startDate)}</TableCell>
                          <TableCell>{formatDate(ad.endDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No analytics data available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Ad Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Ad" : "Add New Ad"}</DialogTitle>
            <DialogDescription>
              Fill in the details to display an ad on the website
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Summer Sale 2025"
                value={form.title || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="link">Ad Link *</Label>
              <Input
                id="link"
                name="link"
                placeholder="https://example.com/offer"
                value={form.link || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                value={form.status || "active"}
                onChange={handleChange}
                className="w-full border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Status will be automatically updated based on start/end dates (server time)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate || ""}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ad will auto-activate on this date (server time)
                </p>
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate || ""}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ad will auto-expire after this date (server time)
                </p>
              </div>
            </div>            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  );
}
