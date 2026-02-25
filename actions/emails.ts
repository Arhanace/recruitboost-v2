"use server";

import { db } from "@/db";
import { emails, activities, coaches, emailTemplates, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc, count } from "drizzle-orm";
import { emailSchema, templateSchema } from "@/lib/validators";
import { sendGmailMessage } from "@/lib/gmail";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const draftSchema = z.object({
  coachId: z.number().int(),
  subject: z.string().optional().default(""),
  body: z.string().optional().default(""),
  templateId: z.number().int().optional(),
});

// ============================================================
// EMAILS
// ============================================================

export async function sendEmail(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  const data = emailSchema.parse(input);

  // Get user's Gmail tokens
  const [user] = await db
    .select({
      email: users.email,
      gmailAccessToken: users.gmailAccessToken,
      gmailRefreshToken: users.gmailRefreshToken,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.gmailAccessToken) {
    throw new Error("Gmail not connected. Please connect your Gmail account in Settings to send emails.");
  }

  // Get coach email
  const [coach] = await db
    .select()
    .from(coaches)
    .where(eq(coaches.id, data.coachId))
    .limit(1);

  if (!coach) throw new Error("Coach not found");

  // Send via Gmail API
  const gmailResult = await sendGmailMessage(
    user.gmailAccessToken,
    user.gmailRefreshToken,
    user.email,
    coach.email,
    data.subject,
    data.body
  );

  // If token was refreshed, persist the new access token
  if (gmailResult.newAccessToken) {
    await db
      .update(users)
      .set({ gmailAccessToken: gmailResult.newAccessToken })
      .where(eq(users.id, userId));
  }

  // Save to database with Gmail IDs
  const [email] = await db
    .insert(emails)
    .values({
      userId,
      coachId: data.coachId,
      subject: data.subject,
      body: data.body,
      templateId: data.templateId ?? null,
      direction: "outbound",
      status: "sent",
      sentAt: new Date().toISOString(),
      gmailMessageId: gmailResult.messageId ?? null,
      gmailThreadId: gmailResult.threadId ?? null,
    })
    .returning();

  // Schedule follow-up if requested
  if (data.followUpDays) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + data.followUpDays);

    await db.insert(emails).values({
      userId,
      coachId: data.coachId,
      subject: `Re: ${data.subject}`,
      body: "",
      direction: "outbound",
      status: "scheduled",
      isFollowUp: true,
      parentEmailId: email.id,
      scheduledFor: scheduledDate.toISOString(),
    });
  }

  await db.insert(activities).values({
    userId,
    coachId: data.coachId,
    type: "email_sent",
    description: `Sent email to ${coach.firstName} ${coach.lastName}: "${data.subject}"`,
  });

  revalidatePath("/outreach");
  revalidatePath("/dashboard");
  return email;
}

export async function saveDraft(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  const data = draftSchema.parse(input);

  const [draft] = await db
    .insert(emails)
    .values({
      userId,
      coachId: data.coachId,
      subject: data.subject || "(no subject)",
      body: data.body || "",
      templateId: data.templateId ?? null,
      direction: "outbound",
      status: "draft",
    })
    .returning();

  revalidatePath("/outreach");
  return draft;
}

export async function getEmails(filters?: {
  coachId?: number;
  direction?: string;
  status?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const conditions = [eq(emails.userId, userId)];

  if (filters?.coachId) conditions.push(eq(emails.coachId, filters.coachId));
  if (filters?.direction) conditions.push(eq(emails.direction, filters.direction));
  if (filters?.status) conditions.push(eq(emails.status, filters.status));

  return db
    .select({
      email: emails,
      coach: coaches,
    })
    .from(emails)
    .innerJoin(coaches, eq(emails.coachId, coaches.id))
    .where(and(...conditions))
    .orderBy(desc(emails.createdAt));
}

export async function getEmailsByCoach(coachId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(emails)
    .where(
      and(eq(emails.userId, session.user.id), eq(emails.coachId, coachId))
    )
    .orderBy(desc(emails.createdAt));
}

export async function deleteEmail(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, session.user.id)));

  revalidatePath("/outreach");
  return { success: true };
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getTemplates() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.userId, session.user.id))
    .orderBy(desc(emailTemplates.createdAt));
}

export async function createTemplate(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const data = templateSchema.parse(input);

  const [template] = await db
    .insert(emailTemplates)
    .values({ ...data, userId: session.user.id })
    .returning();

  await db.insert(activities).values({
    userId: session.user.id,
    type: "template_created",
    description: `Created email template: ${data.name}`,
  });

  revalidatePath("/outreach");
  return template;
}

export async function updateTemplate(
  id: number,
  input: Partial<{ name: string; subject: string; body: string; isDefault: boolean }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [template] = await db
    .update(emailTemplates)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(
      and(
        eq(emailTemplates.id, id),
        eq(emailTemplates.userId, session.user.id)
      )
    )
    .returning();

  revalidatePath("/outreach");
  return template;
}

export async function deleteTemplate(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(emailTemplates)
    .where(
      and(
        eq(emailTemplates.id, id),
        eq(emailTemplates.userId, session.user.id)
      )
    );

  revalidatePath("/outreach");
  return { success: true };
}
