"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface OnboardingData {
  sport: string;
  gender: string;
  graduationYear: number;
  position?: string;
  gpa?: string;
  height?: string;
}

export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.sport || !data.gender || !data.graduationYear) {
    return { success: false, error: "Sport, gender, and graduation year are required" };
  }

  try {
    await db
      .update(users)
      .set({
        sport: data.sport,
        gender: data.gender,
        graduationYear: data.graduationYear,
        position: data.position || null,
        gpa: data.gpa || null,
        height: data.height || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save profile" };
  }
}

export async function needsOnboarding(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const [user] = await db
    .select({ sport: users.sport })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return !user?.sport;
}
