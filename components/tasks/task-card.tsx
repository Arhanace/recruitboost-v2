"use client";

import { format, isPast, isToday } from "date-fns";
import {
  Mail,
  Phone,
  Calendar,
  Search,
  MoreHorizontal,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toggleTaskComplete, deleteTask } from "@/actions/tasks";

export type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  completed: boolean | null;
  priority: string;
  type: string;
  coachId: number | null;
  emailId: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  metadata: Record<string, unknown> | null;
};

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  follow_up: Mail,
  "follow-up": Mail,
  research: Search,
  other: MoreHorizontal,
};

const typeLabels: Record<string, string> = {
  email: "Email",
  call: "Call",
  meeting: "Meeting",
  follow_up: "Follow-up",
  "follow-up": "Follow-up",
  research: "Research",
  other: "Other",
};

function getPriorityClasses(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getTypeClasses(type: string) {
  switch (type) {
    case "email":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "call":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "meeting":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "follow_up":
    case "follow-up":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "research":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getDueDateDisplay(dueDate: string) {
  const date = new Date(dueDate);
  if (isToday(date)) return { text: "Due today", className: "text-orange-600 font-medium" };
  if (isPast(date))
    return {
      text: `Overdue - ${format(date, "MMM d, yyyy")}`,
      className: "text-red-600 font-medium",
    };
  return { text: `Due ${format(date, "MMM d, yyyy")}`, className: "text-muted-foreground" };
}

interface TaskCardProps {
  task: TaskItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isPendingToggle, startToggleTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const TypeIcon = typeIcons[task.type] || CheckSquare;
  const dueInfo = getDueDateDisplay(task.dueDate);

  function handleToggle() {
    startToggleTransition(async () => {
      await toggleTaskComplete(task.id);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTask(task.id);
    });
  }

  return (
    <Card
      className={`transition-all ${
        task.completed ? "opacity-60" : ""
      } ${isPendingDelete ? "opacity-30 scale-95" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={!!task.completed}
            onCheckedChange={handleToggle}
            disabled={isPendingToggle}
            className="mt-1 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-semibold ${
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-600"
                onClick={handleDelete}
                disabled={isPendingDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${getTypeClasses(task.type)}`}
                >
                  {typeLabels[task.type] || task.type}
                </Badge>
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${getPriorityClasses(task.priority)}`}
              >
                {task.priority}
              </Badge>

              <span className={`text-xs ${dueInfo.className}`}>{dueInfo.text}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
