"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Mail,
  Trash2,
  Clock,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
  CheckCircle2,
  MinusCircle,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteEmail } from "@/actions/emails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { titleCase } from "@/lib/utils";

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  school: string;
  sport: string;
  division: string | null;
  conference: string | null;
  role: string | null;
  state: string | null;
  region: string | null;
}

interface Email {
  id: number;
  userId: string;
  coachId: number;
  subject: string;
  body: string;
  direction: string;
  status: string;
  templateId: number | null;
  isFollowUp: boolean | null;
  parentEmailId: number | null;
  scheduledFor: string | null;
  hasResponded: boolean | null;
  gmailMessageId: string | null;
  gmailThreadId: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

export interface EmailWithCoach {
  email: Email;
  coach: Coach;
}

interface EmailListProps {
  initialEmails: EmailWithCoach[];
  counts: {
    all: number;
    sent: number;
    received: number;
    followUps: number;
    drafts: number;
  };
}

type TabFilter = "all" | "sent" | "received" | "follow-ups" | "drafts";

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
          <Mail className="w-3 h-3" />
          Sent
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1">
          <Clock className="w-3 h-3" />
          Scheduled
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-muted text-muted-foreground hover:bg-muted border gap-1">
          <FileText className="w-3 h-3" />
          Draft
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateBody(body: string, maxLength = 140) {
  if (!body) return "";
  const cleaned = body.replace(/\n+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}

export function EmailList({ initialEmails, counts }: EmailListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewEmail, setViewEmail] = useState<EmailWithCoach | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const router = useRouter();

  const filteredEmails = useMemo(() => {
    switch (activeTab) {
      case "sent":
        return initialEmails.filter(
          (item) => item.email.status === "sent" && item.email.direction === "outbound"
        );
      case "received":
        return initialEmails.filter((item) => item.email.direction === "inbound");
      case "follow-ups":
        return initialEmails.filter((item) => item.email.isFollowUp);
      case "drafts":
        return initialEmails.filter((item) => item.email.status === "draft");
      default:
        return initialEmails;
    }
  }, [initialEmails, activeTab]);

  function handleDelete(id: number) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteEmail(id);
      } catch {
        // Error will be handled by revalidation
      } finally {
        setDeletingId(null);
      }
    });
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  async function handleSyncInbox() {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncMessage(data.error || "Failed to sync");
      } else {
        setSyncMessage(
          data.synced > 0
            ? `Synced ${data.synced} new email${data.synced === 1 ? "" : "s"}`
            : "No new emails from coaches"
        );
        router.refresh();
      }
    } catch {
      setSyncMessage("Failed to sync inbox");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  }

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "sent", label: "Sent", count: counts.sent },
    { key: "received", label: "Received", count: counts.received },
    { key: "follow-ups", label: "Follow-ups", count: counts.followUps },
    { key: "drafts", label: "Drafts", count: counts.drafts },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b">
        <div className="flex items-center gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-1">
          {syncMessage && (
            <span className="text-xs text-muted-foreground">{syncMessage}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncInbox}
            disabled={isSyncing}
            className="gap-1.5"
          >
            <Inbox
              className={`w-3.5 h-3.5 ${isSyncing ? "animate-pulse" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Inbox"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Email Cards */}
      {filteredEmails.length === 0 ? (
        <div className="bg-card rounded-lg border">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium text-lg">No emails found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {initialEmails.length === 0
                ? "Compose your first email to start reaching out to coaches"
                : "No emails match the current filter"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map(({ email, coach }) => (
            <div
              key={email.id}
              className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Subject line */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base truncate">
                      {email.subject}
                    </h3>
                  </div>

                  {/* Recipient info */}
                  <p className="text-sm text-muted-foreground">
                    to {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                    {coach.school ? ` - ${coach.school}` : ""}
                  </p>

                  {/* Status badge + date */}
                  <div className="flex items-center gap-3">
                    {statusBadge(email.status)}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(email.sentAt || email.createdAt)}
                    </span>
                  </div>

                  {/* Body preview */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {truncateBody(email.body)}
                  </p>

                  {/* Response status */}
                  <div className="pt-0.5">
                    {email.hasResponded ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Responded
                      </span>
                    ) : email.status === "sent" ? (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MinusCircle className="w-3.5 h-3.5" />
                        No response
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1 h-8"
                    onClick={() => setViewEmail({ email, coach })}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(email.id)}
                    disabled={isPending && deletingId === email.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Email Dialog */}
      <Dialog open={!!viewEmail} onOpenChange={() => setViewEmail(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {viewEmail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg pr-6">
                  {viewEmail.email.subject}
                </DialogTitle>
                <div className="flex items-center gap-3 pt-2">
                  {statusBadge(viewEmail.email.status)}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(
                      viewEmail.email.sentAt || viewEmail.email.createdAt
                    )}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">To: </span>
                  <span className="font-medium">
                    {titleCase(viewEmail.coach.firstName)} {titleCase(viewEmail.coach.lastName)}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({viewEmail.coach.school}
                    {viewEmail.coach.division
                      ? `, ${viewEmail.coach.division}`
                      : ""}
                    )
                  </span>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {viewEmail.email.body}
                  </p>
                </div>
                {viewEmail.email.hasResponded !== null && (
                  <div className="border-t pt-3">
                    {viewEmail.email.hasResponded ? (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Coach has responded to this email
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MinusCircle className="w-4 h-4" />
                        No response yet
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
