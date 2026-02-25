import { getActivities } from "@/actions/activities";
import { ActivityTimeline } from "@/components/activities/activity-timeline";

export default async function ActivitiesPage() {
  const activities = await getActivities({ limit: 50 });

  return <ActivityTimeline initialActivities={activities} />;
}
