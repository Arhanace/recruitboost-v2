"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GmailConnectBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Connect your Gmail to send and receive emails
          </p>
          <p className="text-xs text-muted-foreground">
            Link your Gmail account to email coaches directly from RecruitBoost.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <a href="/api/gmail/connect">Connect Gmail</a>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-muted-foreground hover:text-foreground rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
