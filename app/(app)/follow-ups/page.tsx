import { getFollowUps } from "@/actions/follow-ups";
import { FollowUpList } from "@/components/follow-ups/follow-up-list";

export default async function FollowUpsPage() {
  const followUps = await getFollowUps();

  return <FollowUpList initialFollowUps={followUps} />;
}
