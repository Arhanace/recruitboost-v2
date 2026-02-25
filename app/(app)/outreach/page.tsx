import { getEmails, getTemplates } from "@/actions/emails";
import { ComposeDialog } from "@/components/outreach/compose-dialog";
import { EmailList } from "@/components/outreach/email-list";

interface OutreachPageProps {
  searchParams: Promise<{ coachId?: string }>;
}

export default async function OutreachPage({ searchParams }: OutreachPageProps) {
  const params = await searchParams;
  const coachId = params.coachId ? parseInt(params.coachId, 10) : null;

  const [emailResults, templates] = await Promise.all([
    getEmails(),
    getTemplates(),
  ]);

  // Compute counts for tabs
  const allCount = emailResults.length;
  const sentCount = emailResults.filter(
    (e) => e.email.status === "sent" && e.email.direction === "outbound"
  ).length;
  const receivedCount = emailResults.filter(
    (e) => e.email.direction === "inbound"
  ).length;
  const followUpCount = emailResults.filter(
    (e) => e.email.isFollowUp
  ).length;
  const draftCount = emailResults.filter(
    (e) => e.email.status === "draft"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Outreach</h1>
          <p className="text-muted-foreground mt-1">
            Manage your outreach emails to coaches
          </p>
        </div>
        <ComposeDialog
          templates={templates}
          initialCoachId={coachId}
        />
      </div>

      {/* Email List with built-in tabs */}
      <EmailList
        initialEmails={emailResults}
        counts={{
          all: allCount,
          sent: sentCount,
          received: receivedCount,
          followUps: followUpCount,
          drafts: draftCount,
        }}
      />
    </div>
  );
}
