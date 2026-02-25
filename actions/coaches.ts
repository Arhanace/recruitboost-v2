"use server";

import { db } from "@/db";
import { coaches, savedCoaches } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, like, sql, desc, or, count } from "drizzle-orm";
import { coachFilterSchema } from "@/lib/validators";

export async function getCoaches(filters: Record<string, unknown>) {
  const parsed = coachFilterSchema.parse(filters);
  const { search, sport, division, conference, region, state, page, limit } = parsed;

  const conditions = [];

  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(coaches.firstName, term),
        like(coaches.lastName, term),
        like(coaches.school, term),
        like(coaches.email, term)
      )
    );
  }
  if (sport) conditions.push(eq(coaches.sport, sport));
  if (division) conditions.push(eq(coaches.division, division));
  if (conference) conditions.push(eq(coaches.conference, conference));
  if (region) conditions.push(eq(coaches.region, region));
  if (state) conditions.push(eq(coaches.state, state));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(coaches)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(coaches.school, coaches.lastName),
    db
      .select({ count: count() })
      .from(coaches)
      .where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCoachById(id: number) {
  const [coach] = await db
    .select()
    .from(coaches)
    .where(eq(coaches.id, id))
    .limit(1);
  return coach ?? null;
}

export async function getSchools(filters: Record<string, unknown>) {
  const parsed = coachFilterSchema.parse(filters);
  const { search, sport, division, conference, region, state, page, limit } = parsed;

  const conditions = [];

  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(coaches.firstName, term),
        like(coaches.lastName, term),
        like(coaches.school, term),
        like(coaches.email, term)
      )
    );
  }
  if (sport) conditions.push(eq(coaches.sport, sport));
  if (division) conditions.push(eq(coaches.division, division));
  if (conference) conditions.push(eq(coaches.conference, conference));
  if (region) conditions.push(eq(coaches.region, region));
  if (state) conditions.push(eq(coaches.state, state));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Get distinct school names with pagination
  const [schoolRows, totalResult] = await Promise.all([
    db
      .selectDistinct({ school: coaches.school })
      .from(coaches)
      .where(where)
      .orderBy(coaches.school)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(distinct ${coaches.school})` })
      .from(coaches)
      .where(where),
  ]);

  const totalSchools = totalResult[0]?.count ?? 0;
  const schoolNames = schoolRows.map((r) => r.school);

  // Fetch all coaches for those schools (with same filters applied)
  let schoolCoaches: typeof coaches.$inferSelect[] = [];
  if (schoolNames.length > 0) {
    const schoolConditions = [...conditions];
    schoolConditions.push(
      sql`${coaches.school} IN (${sql.join(
        schoolNames.map((s) => sql`${s}`),
        sql`, `
      )})`
    );
    schoolCoaches = await db
      .select()
      .from(coaches)
      .where(and(...schoolConditions))
      .orderBy(coaches.school, coaches.lastName);
  }

  return {
    data: schoolCoaches,
    total: totalSchools,
    page,
    limit,
    totalPages: Math.ceil(totalSchools / limit),
  };
}

export async function getFilterOptions() {
  const [sports, divisions, conferences, regions, states] = await Promise.all([
    db.selectDistinct({ value: coaches.sport }).from(coaches).orderBy(coaches.sport),
    db.selectDistinct({ value: coaches.division }).from(coaches).where(sql`${coaches.division} IS NOT NULL`).orderBy(coaches.division),
    db.selectDistinct({ value: coaches.conference }).from(coaches).where(sql`${coaches.conference} IS NOT NULL`).orderBy(coaches.conference),
    db.selectDistinct({ value: coaches.region }).from(coaches).where(sql`${coaches.region} IS NOT NULL`).orderBy(coaches.region),
    db.selectDistinct({ value: coaches.state }).from(coaches).where(sql`${coaches.state} IS NOT NULL`).orderBy(coaches.state),
  ]);

  return {
    sports: sports.map((s) => s.value).filter(Boolean),
    divisions: divisions.map((d) => d.value).filter(Boolean) as string[],
    conferences: conferences.map((c) => c.value).filter(Boolean) as string[],
    regions: regions.map((r) => r.value).filter(Boolean) as string[],
    states: states.map((s) => s.value).filter(Boolean) as string[],
  };
}

export async function saveCoach(coachId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .insert(savedCoaches)
    .values({
      userId: session.user.id,
      coachId,
    })
    .onConflictDoNothing();

  return { success: true };
}

export async function unsaveCoach(coachId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(savedCoaches)
    .where(
      and(
        eq(savedCoaches.userId, session.user.id),
        eq(savedCoaches.coachId, coachId)
      )
    );

  return { success: true };
}

export async function toggleFavorite(coachId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(savedCoaches)
    .where(and(eq(savedCoaches.userId, userId), eq(savedCoaches.coachId, coachId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(savedCoaches).values({ userId, coachId, isFavorite: true });
  } else {
    await db
      .update(savedCoaches)
      .set({ isFavorite: !existing[0].isFavorite, updatedAt: new Date().toISOString() })
      .where(eq(savedCoaches.id, existing[0].id));
  }

  return { success: true };
}

export async function updateCoachStatus(coachId: number, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(savedCoaches)
    .where(and(eq(savedCoaches.userId, userId), eq(savedCoaches.coachId, coachId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(savedCoaches).values({ userId, coachId, status });
  } else {
    await db
      .update(savedCoaches)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(savedCoaches.id, existing[0].id));
  }

  return { success: true };
}

export async function getSavedCoaches() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const results = await db
    .select({
      savedCoach: savedCoaches,
      coach: coaches,
    })
    .from(savedCoaches)
    .innerJoin(coaches, eq(savedCoaches.coachId, coaches.id))
    .where(eq(savedCoaches.userId, session.user.id))
    .orderBy(desc(savedCoaches.createdAt));

  return results;
}

export async function getSavedCoachIds() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const results = await db
    .select({ coachId: savedCoaches.coachId })
    .from(savedCoaches)
    .where(eq(savedCoaches.userId, session.user.id));

  return results.map((r) => r.coachId);
}
