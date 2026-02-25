"use client";

import { useState, useMemo } from "react";
import { CheckSquare, ListFilter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard, type TaskItem } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";

interface TaskListProps {
  initialTasks: TaskItem[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filterTasks = useMemo(() => {
    return (tasks: TaskItem[]) => {
      let filtered = tasks;

      if (typeFilter !== "all") {
        filtered = filtered.filter((t) => t.type === typeFilter);
      }
      if (priorityFilter !== "all") {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }

      return filtered;
    };
  }, [typeFilter, priorityFilter]);

  const allTasks = filterTasks(initialTasks);
  const todoTasks = filterTasks(initialTasks.filter((t) => !t.completed));
  const completedTasks = filterTasks(initialTasks.filter((t) => t.completed));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-muted-foreground mt-1">
            Track your recruiting tasks and to-dos
          </p>
        </div>
        <TaskForm />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="outreach">Outreach</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({allTasks.length})
          </TabsTrigger>
          <TabsTrigger value="todo">
            To Do ({todoTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskGrid tasks={allTasks} />
        </TabsContent>

        <TabsContent value="todo">
          <TaskGrid tasks={todoTasks} />
        </TabsContent>

        <TabsContent value="completed">
          <TaskGrid tasks={completedTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskGrid({ tasks }: { tasks: TaskItem[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No tasks found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create tasks to stay on top of your recruiting process
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
