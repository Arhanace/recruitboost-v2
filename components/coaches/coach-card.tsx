"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Trophy,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Phone,
} from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";
import { titleCase } from "@/lib/utils";

export interface Coach {
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

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-orange-600",
    "bg-cyan-600",
    "bg-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface CoachCardProps {
  coach: Coach;
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: (coachId: number) => void;
}

export function CoachCard({ coach, isSaved, isSaving, onToggleSave }: CoachCardProps) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const initials = getInitials(coach.firstName, coach.lastName);
  const avatarColor = getAvatarColor(`${coach.firstName}${coach.lastName}`);

  function handleEmail() {
    router.push(`/outreach?coachId=${coach.id}`);
  }

  return (
    <>
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Initials avatar */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold ${avatarColor}`}
      >
        {initials}
      </div>

      {/* Name & role */}
      <div className="min-w-0 w-48 shrink-0">
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
          {titleCase(coach.firstName)} {titleCase(coach.lastName)}
        </h3>
        {coach.role && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {coach.role}
          </p>
        )}
      </div>

      {/* School */}
      <div className="flex items-center gap-2 min-w-0 w-56 shrink-0">
        <SchoolLogo school={coach.school} size="sm" />
        <span className="text-sm text-foreground truncate">
          {coach.school}
        </span>
      </div>

      {/* Badges - stacked vertically */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {coach.division && (
          <Badge
            variant="outline"
            className={`text-[11px] px-1.5 py-0 font-medium w-fit ${getDivisionBadgeClass(coach.division)}`}
          >
            {coach.division}
          </Badge>
        )}
        {coach.conference && (
          <Badge variant="secondary" className="text-[11px] py-0 font-normal gap-1 w-fit">
            <Trophy className="h-3 w-3" />
            {coach.conference}
          </Badge>
        )}
        {coach.state && (
          <Badge variant="secondary" className="text-[11px] py-0 font-normal gap-1 w-fit">
            <MapPin className="h-3 w-3" />
            {coach.state}
          </Badge>
        )}
      </div>

      {/* Actions - Email/Call stacked, Save beside */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex flex-col gap-1.5">
          {coach.email && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={handleEmail}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
          )}
          {coach.phone && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={() => setShowPhone(true)}
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onToggleSave(coach.id)}
          disabled={isSaving}
          aria-label={isSaved ? "Unsave coach" : "Save coach"}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-blue-600 fill-blue-600" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>

    {/* Phone number modal */}
    <Dialog open={showPhone} onOpenChange={setShowPhone}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>
            {titleCase(coach.firstName)} {titleCase(coach.lastName)}
          </DialogTitle>
          <DialogDescription>
            {coach.role ? `${coach.role} — ` : ""}{coach.school}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone Number</p>
            <a
              href={`tel:${coach.phone}`}
              className="text-lg font-semibold text-foreground hover:text-blue-600 transition-colors"
            >
              {coach.phone}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
