"use client";

import { useState, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  X,
  Mail,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cancelFollowUp } from "@/actions/follow-ups";
import { useToast } from "@/hooks/use-toast";
import { titleCase } from "@/lib/utils";

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  school: string;
  sport: string;
  division: string | null;
  conference: string | null;
  role: string | null;
  state: string | null;
  region: string | null;
}

interface Email {
  id: number;
  userId: string;
  coachId: number;
  subject: string;
  body: string;
  direction: string;
  status: string;
  templateId: number | null;
  isFollowUp: boolean | null;
  parentEmailId: number | null;
  scheduledFor: string | null;
  hasResponded: boolean | null;
  gmailMessageId: string | null;
  gmailThreadId: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

export interface FollowUpWithCoach {
  email: Email;
  coach: Coach;
}

interface FollowUpListProps {
  initialFollowUps: FollowUpWithCoach[];
}

function getScheduleStatus(scheduledFor: string | null) {
  if (!scheduledFor) return { label: "Scheduled", variant: "default" as const };
  const scheduledDate = new Date(scheduledFor);
  const now = new Date();
  if (scheduledDate < now) {
    return { label: "Overdue", variant: "destructive" as const };
  }
  return { label: "Scheduled", variant: "default" as const };
}

export function FollowUpList({ initialFollowUps }: FollowUpListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleCancel(emailId: number) {
    setCancellingId(emailId);
    startTransition(async () => {
      try {
        await cancelFollowUp(emailId);
        toast({
          title: "Follow-up cancelled",
          description: "The scheduled follow-up has been removed.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to cancel the follow-up. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCancellingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Follow-ups</h2>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled follow-ups with coaches
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {initialFollowUps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {initialFollowUps.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Scheduled</p>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {
                  initialFollowUps.filter((f) => {
                    if (!f.email.scheduledFor) return false;
                    return new Date(f.email.scheduledFor) < new Date();
                  }).length
                }
              </p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {
                  initialFollowUps.filter((f) => {
                    if (!f.email.scheduledFor) return false;
                    return new Date(f.email.scheduledFor) >= new Date();
                  }).length
                }
              </p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up cards or empty state */}
      {initialFollowUps.length === 0 ? (
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No follow-ups scheduled</p>
            <p className="text-muted-foreground text-sm mt-1">
              When you send emails with follow-up reminders, they will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialFollowUps.map(({ email, coach }) => {
            const scheduleStatus = getScheduleStatus(email.scheduledFor);
            const isOverdue = scheduleStatus.label === "Overdue";

            return (
              <Card
                key={email.id}
                className={isOverdue ? "border-red-200 bg-red-50/30" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium truncate max-w-[300px]">
                        {email.subject}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={scheduleStatus.variant === "destructive" ? "destructive" : "outline"}
                      className={
                        scheduleStatus.variant !== "destructive"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                          : ""
                      }
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {scheduleStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Coach info */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                      {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                    </span>
                    <span className="text-muted-foreground">
                      - {coach.school}
                      {coach.division ? ` (${coach.division})` : ""}
                    </span>
                  </div>

                  {/* Scheduled date */}
                  {email.scheduledFor && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(email.scheduledFor), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatDistanceToNow(new Date(email.scheduledFor), {
                          addSuffix: true,
                        })})
                      </span>
                    </div>
                  )}

                  {/* Email preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {email.body}
                  </p>

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(email.id)}
                      disabled={isPending && cancellingId === email.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {isPending && cancellingId === email.id
                        ? "Cancelling..."
                        : "Cancel Follow-up"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
