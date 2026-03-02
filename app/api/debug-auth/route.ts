import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  // Check env vars (redacted)
  const envCheck = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    secretLength: secret?.length || 0,
  };

  // Check cookies
  const cookies = req.cookies.getAll().map(c => ({
    name: c.name,
    valueLength: c.value.length,
  }));

  // Try getToken
  let tokenResult: unknown = null;
  let tokenError: string | null = null;
  try {
    tokenResult = await getToken({ req, secret });
  } catch (e: unknown) {
    tokenError = e instanceof Error ? e.message : String(e);
  }

  // Try auth()
  let sessionResult: unknown = null;
  let sessionError: string | null = null;
  try {
    sessionResult = await auth();
  } catch (e: unknown) {
    sessionError = e instanceof Error ? e.message : String(e);
  }

  // Try DB
  let dbResult: unknown = null;
  let dbError: string | null = null;
  try {
    const count = await db.select({ id: users.id }).from(users).limit(1);
    dbResult = { connected: true, userCount: count.length };
  } catch (e: unknown) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    envCheck,
    cookies,
    token: tokenResult ? { exists: true, sub: (tokenResult as Record<string, unknown>).sub, id: (tokenResult as Record<string, unknown>).id } : null,
    tokenError,
    session: sessionResult,
    sessionError,
    db: dbResult,
    dbError,
  });
}
