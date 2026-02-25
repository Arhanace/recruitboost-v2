"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  Mail,
  Sparkles,
  CheckSquare,
  ListTodo,
  FileText,
  Link,
  UserPlus,
  UserCog,
  Activity,
  ListFilter,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { titleCase } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActivityItem = {
  activity: {
    id: number;
    userId: string;
    coachId: number | null;
    type: string;
    description: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  };
  coach: {
    id: number;
    firstName: string;
    lastName: string;
    school: string;
    sport: string;
    division: string | null;
    conference: string | null;
    role: string | null;
    email: string;
    phone: string | null;
    state: string | null;
    region: string | null;
  } | null;
};

const activityTypeConfig: Record<
  string,
  { icon: typeof Mail; label: string; textColor: string; bgColor: string }
> = {
  email_sent: {
    icon: Mail,
    label: "Email Sent",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  ai_email_generated: {
    icon: Sparkles,
    label: "AI Email Generated",
    textColor: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  task_created: {
    icon: ListTodo,
    label: "Task Created",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  task_completed: {
    icon: CheckSquare,
    label: "Task Completed",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  template_created: {
    icon: FileText,
    label: "Template Created",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  gmail_connected: {
    icon: Link,
    label: "Gmail Connected",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
  },
  gmail_disconnected: {
    icon: Link,
    label: "Gmail Disconnected",
    textColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  coach_saved: {
    icon: UserPlus,
    label: "Coach Saved",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  profile_updated: {
    icon: UserCog,
    label: "Profile Updated",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
};

const activityTypes = [
  { value: "all", label: "All Types" },
  { value: "email_sent", label: "Email Sent" },
  { value: "ai_email_generated", label: "AI Email Generated" },
  { value: "task_created", label: "Task Created" },
  { value: "task_completed", label: "Task Completed" },
  { value: "template_created", label: "Template Created" },
  { value: "gmail_connected", label: "Gmail Connected" },
  { value: "coach_saved", label: "Coach Saved" },
  { value: "profile_updated", label: "Profile Updated" },
];

function getConfig(type: string) {
  return (
    activityTypeConfig[type] ?? {
      icon: Activity,
      label: type,
      textColor: "text-muted-foreground",
      bgColor: "bg-muted",
    }
  );
}

function groupActivitiesByDate(activities: ActivityItem[]) {
  const groups: { label: string; activities: ActivityItem[] }[] = [];
  const buckets: Record<string, ActivityItem[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const item of activities) {
    const date = new Date(item.activity.createdAt);
    if (isToday(date)) {
      buckets["Today"].push(item);
    } else if (isYesterday(date)) {
      buckets["Yesterday"].push(item);
    } else if (isThisWeek(date)) {
      buckets["This Week"].push(item);
    } else {
      buckets["Earlier"].push(item);
    }
  }

  for (const label of ["Today", "Yesterday", "This Week", "Earlier"]) {
    if (buckets[label].length > 0) {
      groups.push({ label, activities: buckets[label] });
    }
  }

  return groups;
}

interface ActivityTimelineProps {
  initialActivities: ActivityItem[];
}

export function ActivityTimeline({ initialActivities }: ActivityTimelineProps) {
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    if (typeFilter === "all") return initialActivities;
    return initialActivities.filter((item) => item.activity.type === typeFilter);
  }, [initialActivities, typeFilter]);

  const groups = useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activities</h2>
          <p className="text-muted-foreground mt-1">
            View your recruiting activity history
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((at) => (
              <SelectItem key={at.value} value={at.value}>
                {at.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeFilter !== "all" && (
          <span className="text-xs text-muted-foreground">
            {filteredActivities.length} result{filteredActivities.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Empty state */}
      {filteredActivities.length === 0 ? (
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No activities found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {typeFilter === "all"
                ? "Your recruiting activities will be logged here automatically"
                : "No activities match the selected filter"}
            </p>
          </div>
        </div>
      ) : (
        /* Timeline grouped by date */
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {group.activities.map((item, index) => {
                    const config = getConfig(item.activity.type);
                    const Icon = config.icon;

                    return (
                      <div
                        key={item.activity.id}
                        className="flex items-start gap-4 py-3"
                      >
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${config.bgColor}`}
                          >
                            <Icon className={`w-4 h-4 ${config.textColor}`} />
                          </div>
                          {index < group.activities.length - 1 && (
                            <div className="absolute left-1/2 top-9 w-px h-[calc(100%+4px)] -translate-x-1/2 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {item.activity.description}
                          </p>
                          {item.coach && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {titleCase(item.coach.firstName)} {titleCase(item.coach.lastName)} -{" "}
                              {item.coach.school}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(item.activity.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
