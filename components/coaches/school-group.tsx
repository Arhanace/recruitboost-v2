"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MapPin,
  Trophy,
  ChevronDown,
  ChevronRight,
  Users,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";
import { titleCase } from "@/lib/utils";
import type { Coach } from "@/components/coaches/coach-card";

const DIVISION_COLORS: Record<string, string> = {
  "NCAA D1": "bg-blue-100 text-blue-800 border-blue-200",
  "NCAA D2": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "NCAA D3": "bg-violet-100 text-violet-800 border-violet-200",
  NAIA: "bg-amber-100 text-amber-800 border-amber-200",
  NJCAA: "bg-rose-100 text-rose-800 border-rose-200",
};

function getDivisionBadgeClass(division: string | null): string {
  if (!division) return "bg-gray-100 text-gray-600 border-gray-200";
  return DIVISION_COLORS[division] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getPersonAvatarColor(name: string): string {
  const colors = [
    "bg-slate-600",
    "bg-zinc-600",
    "bg-neutral-600",
    "bg-stone-600",
    "bg-gray-600",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export interface SchoolGroup {
  school: string;
  coaches: Coach[];
  division: string | null;
  conference: string | null;
  state: string | null;
}

interface SchoolGroupCardProps {
  group: SchoolGroup;
  savedIds: Set<number>;
  savingIds: Set<number>;
  onToggleSave: (coachId: number) => void;
}

export function SchoolGroupCard({
  group,
  savedIds,
  savingIds,
  onToggleSave,
}: SchoolGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* School header row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 w-full p-4 text-left hover:bg-accent/50 transition-colors"
      >
        {/* School logo */}
        <SchoolLogo school={group.school} size="lg" />

        {/* School info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {group.school}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {group.state && (
              <Badge variant="secondary" className="text-[11px] font-normal gap-1 py-0">
                <MapPin className="h-3 w-3" />
                {group.state}
              </Badge>
            )}
            {group.conference && (
              <Badge variant="secondary" className="text-[11px] font-normal gap-1 py-0">
                <Trophy className="h-3 w-3" />
                {group.conference}
              </Badge>
            )}
            {group.division && (
              <Badge
                variant="outline"
                className={`text-[11px] font-medium px-1.5 py-0 ${getDivisionBadgeClass(group.division)}`}
              >
                {group.division}
              </Badge>
            )}
          </div>
        </div>

        {/* Coach count + chevron */}
        <div className="flex items-center gap-2 shrink-0 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{group.coaches.length} coach{group.coaches.length !== 1 ? "es" : ""}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded coaches list */}
      {isExpanded && (
        <div className="border-t bg-muted/30">
          {group.coaches.map((coach) => {
            const isSaved = savedIds.has(coach.id);
            const isSaving = savingIds.has(coach.id);
            const initials = getInitials(coach.firstName, coach.lastName);
            const personColor = getPersonAvatarColor(`${coach.firstName}${coach.lastName}`);
            const roleDisplay = [coach.role, coach.sport].filter(Boolean).join(" \u00B7 ");

            return (
              <div
                key={coach.id}
                className="flex items-center gap-4 px-4 py-3 border-t first:border-t-0 ml-4"
              >
                {/* Coach avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${personColor}`}
                >
                  {initials}
                </div>

                {/* Coach info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                  </p>
                  {roleDisplay && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {roleDisplay}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {coach.email && (
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs h-7 px-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/outreach?coachId=${coach.id}`);
                      }}
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(coach.id);
                    }}
                    disabled={isSaving}
                    aria-label={isSaved ? "Unsave coach" : "Save coach"}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
