import { auth } from "@/auth";
import { getCoaches, getFilterOptions, getSavedCoachIds } from "@/actions/coaches";
import { CoachTable } from "@/components/coaches/coach-table";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SchoolDatabasePage() {
  const session = await auth();

  // Fetch sport directly from DB to avoid stale JWT
  let userSport: string | null = null;
  if (session?.user?.id) {
    const [dbUser] = await db
      .select({ sport: users.sport })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    userSport = dbUser?.sport ?? null;
  }

  const [coachResult, filterOptions, savedIds] = await Promise.all([
    getCoaches({ page: 1, limit: 25, ...(userSport ? { sport: userSport } : {}) }),
    getFilterOptions(),
    getSavedCoachIds(),
  ]);

  return (
    <div className="space-y-6">
      <CoachTable
        initialData={coachResult.data}
        initialTotal={coachResult.total}
        initialPage={coachResult.page}
        initialLimit={coachResult.limit}
        initialTotalPages={coachResult.totalPages}
        initialSavedIds={savedIds}
        filterOptions={filterOptions}
        userSport={userSport}
      />
    </div>
  );
}
