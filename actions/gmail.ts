"use server";

import { db } from "@/db";
import { users, activities } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function disconnectGmail() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailTokenExpiry: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, session.user.id));

  await db.insert(activities).values({
    userId: session.user.id,
    type: "gmail_disconnected",
    description: "Disconnected Gmail account",
  });

  revalidatePath("/settings");
  return { success: true };
}
