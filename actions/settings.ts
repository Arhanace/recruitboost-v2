"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { settingsSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [user] = await db
    .select({
      notificationsEnabled: users.notificationsEnabled,
      theme: users.theme,
      gmailConnected: users.gmailAccessToken,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  return {
    notificationsEnabled: user?.notificationsEnabled ?? true,
    theme: user?.theme ?? "system",
    gmailConnected: !!user?.gmailConnected,
  };
}

export async function updateSettings(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = settingsSchema.parse(input);

  await db
    .update(users)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  return { success: true };
}
