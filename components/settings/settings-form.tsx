"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Mail,
  Save,
  Loader2,
  Link,
  Unlink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/actions/settings";
import { disconnectGmail } from "@/actions/gmail";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  notificationsEnabled: boolean;
  theme: string;
  gmailConnected: boolean;
}

interface SettingsFormProps {
  initialSettings: SettingsData;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialSettings.notificationsEnabled
  );
  const [gmailConnected, setGmailConnected] = useState(
    initialSettings.gmailConnected
  );
  const [isPending, startTransition] = useTransition();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  function handleSaveSettings() {
    startTransition(async () => {
      try {
        await updateSettings({ notificationsEnabled, theme: "light" });
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  function handleDisconnectGmail() {
    setIsDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectGmail();
        setGmailConnected(false);
        toast({
          title: "Gmail disconnected",
          description: "Your Gmail account has been disconnected.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to disconnect Gmail. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDisconnecting(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure your account and application preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isPending}>
          {isPending && !isDisconnecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how you receive updates and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Enable Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive reminders for follow-ups, tasks, and other recruiting
                activities
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gmail Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>
            Connect your Gmail account to send emails directly from RecruitBoost
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {gmailConnected ? (
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {gmailConnected ? "Gmail Connected" : "Gmail Not Connected"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gmailConnected
                    ? "Your Gmail account is linked. Emails will be sent through your Gmail."
                    : "Connect your Gmail to send emails directly to coaches."}
                </p>
              </div>
            </div>
            {gmailConnected ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDisconnectGmail}
                disabled={isPending && isDisconnecting}
              >
                {isPending && isDisconnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4 mr-2" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button asChild>
                <a href="/api/gmail/connect">
                  <Link className="w-4 h-4 mr-2" />
                  Connect Gmail
                </a>
              </Button>
            )}
          </div>

          {gmailConnected && (
            <>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                RecruitBoost only uses Gmail access to send emails on your behalf.
                You can disconnect at any time to revoke access.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
