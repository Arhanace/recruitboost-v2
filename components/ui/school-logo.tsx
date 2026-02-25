"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SCHOOL_DOMAINS } from "@/lib/school-domains";

interface SchoolLogoProps {
  school: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CONFIG = {
  sm: { container: "h-5 w-5", text: "text-[8px]" },
  md: { container: "h-8 w-8", text: "text-xs" },
  lg: { container: "h-11 w-11", text: "text-sm" },
};

function getSchoolColor(school: string): string {
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
  for (let i = 0; i < school.length; i++) {
    hash = school.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getLogoSources(school: string): string[] {
  const domain = SCHOOL_DOMAINS[school];
  if (!domain) return [];
  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://logo.clearbit.com/${domain}?size=256`,
    `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`,
  ];
}

export function getSchoolLogoUrl(school: string): string | null {
  const sources = getLogoSources(school);
  return sources[0] ?? null;
}

export function SchoolLogo({ school, size = "md", className }: SchoolLogoProps) {
  const sources = getLogoSources(school);
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const config = SIZE_CONFIG[size];
  const initial = school.charAt(0).toUpperCase();

  function handleError() {
    const next = srcIndex + 1;
    if (next < sources.length) {
      setSrcIndex(next);
    } else {
      setFailed(true);
    }
  }

  if (sources.length === 0 || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full text-white font-semibold",
          config.container,
          config.text,
          getSchoolColor(school),
          className
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={sources[srcIndex]}
      alt={`${school} logo`}
      className={cn("shrink-0 rounded-sm object-contain", config.container, className)}
      onError={handleError}
    />
  );
}
