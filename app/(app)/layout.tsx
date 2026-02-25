import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { GmailConnectBanner } from "@/components/onboarding/gmail-connect-banner";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user needs onboarding (no sport set) and Gmail status
  const [user] = await db
    .select({ sport: users.sport, gmailAccessToken: users.gmailAccessToken })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const showOnboarding = !user?.sport;
  const showGmailBanner = !!user?.sport && !user?.gmailAccessToken;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {showGmailBanner && <GmailConnectBanner />}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}
