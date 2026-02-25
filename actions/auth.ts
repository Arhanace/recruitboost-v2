"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signUpSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function signUpAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
  });

  return { success: true };
}
