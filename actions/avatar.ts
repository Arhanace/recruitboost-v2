"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 2MB.");
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await db
    .update(users)
    .set({ image: dataUrl, updatedAt: new Date().toISOString() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
  return { success: true, image: dataUrl };
}

export async function removeAvatar() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ image: null, updatedAt: new Date().toISOString() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
  return { success: true };
}
