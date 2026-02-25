import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, emails, coaches } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { syncGmailInbox } from "@/lib/gmail";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      gmailAccessToken: users.gmailAccessToken,
      gmailRefreshToken: users.gmailRefreshToken,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.gmailAccessToken) {
    return NextResponse.json(
      { error: "Gmail not connected" },
      { status: 400 }
    );
  }

  try {
    const { messages, newAccessToken } = await syncGmailInbox(
      user.gmailAccessToken,
      user.gmailRefreshToken,
      30
    );

    // Persist refreshed token if applicable
    if (newAccessToken) {
      await db
        .update(users)
        .set({ gmailAccessToken: newAccessToken })
        .where(eq(users.id, session.user.id));
    }

    // Get all coach emails for matching
    const allCoaches = await db
      .select({ id: coaches.id, email: coaches.email })
      .from(coaches);

    const coachEmailMap = new Map(
      allCoaches.map((c) => [c.email.toLowerCase(), c.id])
    );

    // Get existing Gmail message IDs to avoid duplicates
    const existingEmails = await db
      .select({ gmailMessageId: emails.gmailMessageId })
      .from(emails)
      .where(eq(emails.userId, session.user.id));

    const existingIds = new Set(
      existingEmails
        .map((e) => e.gmailMessageId)
        .filter(Boolean)
    );

    let synced = 0;

    for (const msg of messages) {
      // Skip if already imported
      if (existingIds.has(msg.gmailMessageId)) continue;

      // Match sender to a coach
      const coachId = coachEmailMap.get(msg.from.toLowerCase());
      if (!coachId) continue;

      await db.insert(emails).values({
        userId: session.user.id,
        coachId,
        subject: msg.subject || "(no subject)",
        body: msg.body || "",
        direction: "inbound",
        status: "received",
        gmailMessageId: msg.gmailMessageId,
        gmailThreadId: msg.threadId,
        receivedAt: msg.receivedAt,
      });

      synced++;
    }

    return NextResponse.json({ synced });
  } catch {
    return NextResponse.json(
      { error: "Failed to sync emails" },
      { status: 500 }
    );
  }
}
