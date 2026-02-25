"use server";

import { db } from "@/db";
import { emails, activities, coaches } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFollowUps() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  return db
    .select({
      email: emails,
      coach: coaches,
    })
    .from(emails)
    .innerJoin(coaches, eq(emails.coachId, coaches.id))
    .where(
      and(
        eq(emails.userId, userId),
        eq(emails.status, "scheduled"),
        eq(emails.isFollowUp, true)
      )
    )
    .orderBy(emails.scheduledFor);
}

export async function cancelFollowUp(emailId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(emails)
    .where(
      and(
        eq(emails.id, emailId),
        eq(emails.userId, session.user.id),
        eq(emails.status, "scheduled")
      )
    );

  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getDueFollowUps() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  return db
    .select({
      email: emails,
      coach: coaches,
    })
    .from(emails)
    .innerJoin(coaches, eq(emails.coachId, coaches.id))
    .where(
      and(
        eq(emails.userId, userId),
        eq(emails.status, "scheduled"),
        eq(emails.isFollowUp, true),
        lte(emails.scheduledFor, new Date().toISOString())
      )
    )
    .orderBy(emails.scheduledFor);
}
