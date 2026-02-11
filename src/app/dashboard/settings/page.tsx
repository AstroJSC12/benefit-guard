"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Download, Loader2, Trash2, User, Bell, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TabKey = "profile" | "notifications" | "account";

type ProfileForm = {
  name: string;
  email: string;
  zipCode: string;
  state: string;
  phone: string;
};

type NotificationSettings = {
  newFeatures: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
};

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const ZIP_CODE_REGEX = /^\d{5}$/;
const US_PHONE_REGEX = /^(?:\+1\s?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/;
const NOTIFICATION_KEY = "benefit-guard-notification-preferences";

const tabItems: Array<{ key: TabKey; label: string; icon: typeof User }> = [
  { key: "profile", label: "Profile", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "account", label: "Account", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    email: "",
    zipCode: "",
    state: "",
    phone: "",
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newFeatures: true,
    securityAlerts: true,
    weeklyDigest: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedPreferences = localStorage.getItem(NOTIFICATION_KEY);

    if (storedPreferences) {
      try {
        setNotifications(JSON.parse(storedPreferences) as NotificationSettings);
      } catch {
        localStorage.removeItem(NOTIFICATION_KEY);
      }
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        setProfileForm({
          name: data.name ?? "",
          email: data.email ?? "",
          zipCode: data.zipCode ?? "",
          state: data.state ?? "",
          phone: data.phone ?? "",
        });
      } catch {
        setError("Unable to load your profile right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profileValidationMessage = useMemo(() => {
    if (profileForm.zipCode && !ZIP_CODE_REGEX.test(profileForm.zipCode)) {
      return "Zip code must be exactly 5 digits.";
    }

    if (profileForm.phone && !US_PHONE_REGEX.test(profileForm.phone)) {
      return "Phone number must be a valid US format.";
    }

    return null;
  }, [profileForm.phone, profileForm.zipCode]);

  const updateNotifications = (key: keyof NotificationSettings, checked: boolean) => {
    const nextState = { ...notifications, [key]: checked };
    setNotifications(nextState);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(nextState));
  };

  const saveProfile = async () => {
    setFeedback(null);
    setError(null);

    if (profileValidationMessage) {
      setError(profileValidationMessage);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name,
          zipCode: profileForm.zipCode,
          state: profileForm.state,
          phone: profileForm.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setFeedback("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setFeedback(null);
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportData = async () => {
    setFeedback(null);
    setError(null);
    setIsExporting(true);

    try {
      const response = await fetch("/api/user/export");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export user data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "benefit-guard-user-data.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setFeedback("Data export started.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export your data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, notifications, and account actions.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {tabItems.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? "default" : "outline"}
                className={cn("justify-start", activeTab === key && "bg-primary text-primary-foreground")}
                onClick={() => {
                  setActiveTab(key);
                  setFeedback(null);
                  setError(null);
                }}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {feedback && <p className="text-sm text-primary">{feedback}</p>}

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Your full name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profileForm.email} disabled readOnly />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip code</Label>
                <Input
                  id="zipCode"
                  value={profileForm.zipCode}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, zipCode: event.target.value }))
                  }
                  placeholder="12345"
                  maxLength={5}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={profileForm.state}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, state: event.target.value }))
                  }
                  className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isLoading}
                >
                  <option value="">Select a state</option>
                  {STATES.map((stateValue) => (
                    <option key={stateValue} value={stateValue}>
                      {stateValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="(555) 123-4567"
                disabled={isLoading}
              />
            </div>

            <Button onClick={saveProfile} disabled={isLoading || isSaving || !!profileValidationMessage}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control email updates from BenefitGuard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="new-features">New features</Label>
                <p className="text-sm text-muted-foreground">Product updates and feature announcements.</p>
              </div>
              <Switch
                id="new-features"
                checked={notifications.newFeatures}
                onCheckedChange={(checked) => updateNotifications("newFeatures", checked)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="security-alerts">Security alerts</Label>
                <p className="text-sm text-muted-foreground">Important activity and account security messages.</p>
              </div>
              <Switch
                id="security-alerts"
                checked={notifications.securityAlerts}
                onCheckedChange={(checked) => updateNotifications("securityAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="weekly-digest">Weekly digest</Label>
                <p className="text-sm text-muted-foreground">A recap of saved documents and conversations.</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) => updateNotifications("weeklyDigest", checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "account" && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Download your data or permanently delete your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={exportData} disabled={isExporting}>
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Export My Data
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete your account?</DialogTitle>
                  <DialogDescription>
                    This action is permanent and will remove your profile, documents, conversations, and messages.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="size-4 animate-spin" />}
                    Permanently delete account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
