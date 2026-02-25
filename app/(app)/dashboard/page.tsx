import { Reply, Users, ClipboardList } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { getSavedCoaches } from "@/actions/coaches";
import { getEmails } from "@/actions/emails";
import { StatCard } from "@/components/dashboard/stat-card";
import { SavedCoachesTable } from "@/components/dashboard/saved-coaches-table";
import { RecentResponses } from "@/components/dashboard/recent-responses";

export default async function DashboardPage() {
  const [stats, savedCoaches, responses] = await Promise.all([
    getDashboardStats(),
    getSavedCoaches(),
    getEmails({ direction: "inbound" }),
  ]);

  const statCards = [
    {
      label: "Responses",
      value: stats.responses,
      icon: Reply,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Schools Contacted",
      value: stats.coachesContacted,
      icon: Users,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      label: "Follow-ups Due",
      value: stats.followUpsDue,
      icon: ClipboardList,
      iconColor: "text-red-500",
      iconBg: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your recruiting activity at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <SavedCoachesTable coaches={savedCoaches} />

      <RecentResponses responses={responses} />
    </div>
  );
}
