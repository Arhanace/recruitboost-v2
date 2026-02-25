"use server";

import { db } from "@/db";
import { emails, savedCoaches, tasks } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, count, lte, sql } from "drizzle-orm";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return { emailsSent: 0, responses: 0, coachesContacted: 0, followUpsDue: 0 };
  }
  const userId = session.user.id;

  const [emailsSent, responses, coachesContacted, followUpsDue] = await Promise.all([
    db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, userId), eq(emails.direction, "outbound"), eq(emails.status, "sent"))),
    db
      .select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, userId), eq(emails.direction, "inbound"))),
    db
      .select({ count: sql<number>`count(DISTINCT ${emails.coachId})` })
      .from(emails)
      .where(and(eq(emails.userId, userId), eq(emails.direction, "outbound"))),
    db
      .select({ count: count() })
      .from(emails)
      .where(
        and(
          eq(emails.userId, userId),
          eq(emails.status, "scheduled"),
          lte(emails.scheduledFor, new Date().toISOString())
        )
      ),
  ]);

  return {
    emailsSent: emailsSent[0]?.count ?? 0,
    responses: responses[0]?.count ?? 0,
    coachesContacted: coachesContacted[0]?.count ?? 0,
    followUpsDue: followUpsDue[0]?.count ?? 0,
  };
}
