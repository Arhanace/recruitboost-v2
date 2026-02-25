"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { profileSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) throw new Error("User not found");

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    sport: user.sport,
    position: user.position,
    height: user.height,
    graduationYear: user.graduationYear,
    gender: user.gender,
    keyStats: user.keyStats,
    highlights: user.highlights,
    bio: user.bio,
    gpa: user.gpa,
    testScores: user.testScores,
    academicHonors: user.academicHonors,
    intendedMajor: user.intendedMajor,
    preferredLocation: user.preferredLocation,
    preferredSchoolSize: user.preferredSchoolSize,
    preferredProgramLevel: user.preferredProgramLevel,
  };
}

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = profileSchema.parse(input);
  const userId = session.user.id;

  await db
    .update(users)
    .set({
      ...data,
      graduationYear: data.graduationYear ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/profile");
  return { success: true };
}
