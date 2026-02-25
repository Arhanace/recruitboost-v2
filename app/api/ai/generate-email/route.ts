import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, activities, coaches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateEmail } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 requests per minute per user
  const { success } = rateLimit(`ai:${session.user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { coachId, tone, additionalContext } = body;

    if (!coachId || !tone) {
      return NextResponse.json(
        { error: "coachId and tone are required" },
        { status: 400 }
      );
    }

    // Get coach info
    const [coach] = await db
      .select()
      .from(coaches)
      .where(eq(coaches.id, coachId));

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Get user info for athlete profile
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    const result = await generateEmail({
      coachName: `${coach.firstName} ${coach.lastName}`,
      coachSchool: coach.school,
      coachSport: coach.sport,
      coachDivision: coach.division ?? undefined,
      coachRole: coach.role ?? undefined,
      athleteName: user.name,
      athleteSport: user.sport ?? undefined,
      athletePosition: user.position ?? undefined,
      athleteGpa: user.gpa ?? undefined,
      athleteHeight: user.height ?? undefined,
      athleteKeyStats: user.keyStats ?? undefined,
      athleteHighlights: user.highlights ?? undefined,
      athleteBio: user.bio ?? undefined,
      tone,
      additionalContext,
    });

    // Log activity
    await db.insert(activities).values({
      userId: session.user.id,
      coachId: coach.id,
      type: "ai_email_generated",
      description: `Generated AI email for ${coach.firstName} ${coach.lastName} (${tone} tone)`,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
