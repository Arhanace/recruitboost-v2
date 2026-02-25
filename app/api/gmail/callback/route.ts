import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createGmailOAuth2Client } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", request.url));
  }

  try {
    const oauth2Client = createGmailOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    await db
      .update(users)
      .set({
        gmailAccessToken: tokens.access_token ?? null,
        gmailRefreshToken: tokens.refresh_token ?? null,
        gmailTokenExpiry: tokens.expiry_date ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, session.user.id));

    await db.insert(activities).values({
      userId: session.user.id,
      type: "gmail_connected",
      description: "Connected Gmail account",
    });

    return NextResponse.redirect(new URL("/settings?gmail=connected", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=gmail_auth_failed", request.url)
    );
  }
}
