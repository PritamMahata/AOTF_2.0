"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@aotf/ui/components/label";
import { Checkbox } from "@aotf/ui/components/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NotificationProps {
  userRole?: "teacher" | "guardian";
}

const Notification = ({ userRole }: NotificationProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    marketingEmails: true,
    applicationAlerts: true, // guardianResponses for teacher, teacherAlerts for guardian
  });

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const endpoint = userRole === "teacher" 
          ? "/api/teacher/notification-preferences"
          : "/api/guardian/notification-preferences";

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.notificationPreferences) {
            setPreferences({
              marketingEmails: data.notificationPreferences.marketingEmails,
              applicationAlerts: userRole === "teacher" 
                ? data.notificationPreferences.guardianResponses
                : data.notificationPreferences.teacherAlerts,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchPreferences();
    }
  }, [userRole]);

  // Update notification preference
  const updatePreference = async (key: string, value: boolean) => {
    try {
      setSaving(true);
      const endpoint = userRole === "teacher" 
        ? "/api/teacher/notification-preferences"
        : "/api/guardian/notification-preferences";

      const body = userRole === "teacher"
        ? {
            marketingEmails: key === "marketingEmails" ? value : preferences.marketingEmails,
            guardianResponses: key === "applicationAlerts" ? value : preferences.applicationAlerts,
          }
        : {
            marketingEmails: key === "marketingEmails" ? value : preferences.marketingEmails,
            teacherAlerts: key === "applicationAlerts" ? value : preferences.applicationAlerts,
          };

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setPreferences((prev) => ({ ...prev, [key]: value }));
        toast.success("Notification preferences updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update preferences");
        // Revert the change
        setPreferences((prev) => ({ ...prev, [key]: !value }));
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error("Failed to update notification preferences");
      // Revert the change
      setPreferences((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    // Optimistically update UI
    setPreferences((prev) => ({ ...prev, [key]: checked }));
    // Make API call
    updatePreference(key, checked);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notifications</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <Label
              htmlFor="marketing-emails"
              className="text-base font-medium"
            >
              Marketing Emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new features and updates
            </p>
          </div>
          <Checkbox
            id="marketing-emails"
            checked={preferences.marketingEmails}
            onCheckedChange={(checked) =>
              handleCheckboxChange("marketingEmails", checked as boolean)
            }
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
