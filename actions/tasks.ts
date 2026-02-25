"use server";

import { db } from "@/db";
import { tasks, activities } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc, asc, lte, sql } from "drizzle-orm";
import { taskSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getTasks(filters?: {
  completed?: boolean;
  type?: string;
  priority?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = [eq(tasks.userId, userId)];

  if (filters?.completed !== undefined) {
    conditions.push(eq(tasks.completed, filters.completed));
  }
  if (filters?.type) {
    conditions.push(eq(tasks.type, filters.type));
  }
  if (filters?.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate), desc(tasks.createdAt));
}

export async function createTask(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const data = taskSchema.parse(input);

  const [task] = await db
    .insert(tasks)
    .values({ ...data, userId })
    .returning();

  await db.insert(activities).values({
    userId,
    coachId: data.coachId ?? null,
    type: "task_created",
    description: `Created task: ${data.title}`,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(id: number, input: Partial<{
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  type: string;
  completed: boolean;
}>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
    .returning();

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function toggleTaskComplete(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1);

  if (existing.length === 0) throw new Error("Task not found");

  const newCompleted = !existing[0].completed;

  await db
    .update(tasks)
    .set({ completed: newCompleted, updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));

  if (newCompleted) {
    await db.insert(activities).values({
      userId,
      type: "task_completed",
      description: `Completed task: ${existing[0].title}`,
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { completed: newCompleted };
}

export async function deleteTask(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUpcomingTasks(limit = 5) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.completed, false)))
    .orderBy(asc(tasks.dueDate))
    .limit(limit);
}
