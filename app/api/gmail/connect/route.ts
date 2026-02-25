import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGmailAuthUrl } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const authUrl = getGmailAuthUrl();
  return NextResponse.redirect(authUrl);
}
