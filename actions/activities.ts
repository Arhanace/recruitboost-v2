"use server";

import { db } from "@/db";
import { activities, coaches } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";

export async function getActivities(filters?: { type?: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = [eq(activities.userId, userId)];
  if (filters?.type) conditions.push(eq(activities.type, filters.type));

  return db
    .select({
      activity: activities,
      coach: coaches,
    })
    .from(activities)
    .leftJoin(coaches, eq(activities.coachId, coaches.id))
    .where(and(...conditions))
    .orderBy(desc(activities.createdAt))
    .limit(filters?.limit ?? 50);
}

export async function getRecentActivities(limit = 5) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  return db
    .select({
      activity: activities,
      coach: coaches,
    })
    .from(activities)
    .leftJoin(coaches, eq(activities.coachId, coaches.id))
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}
