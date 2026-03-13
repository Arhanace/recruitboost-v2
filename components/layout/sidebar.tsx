"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  UserCircle,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/school-database", label: "Coach Database", icon: GraduationCap },
  { href: "/outreach", label: "Outreach", icon: MessageSquare },
  { href: "/profile", label: "My Profile", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const sport = (session?.user as { sport?: string | null })?.sport || null;
  const graduationYear = (session?.user as { graduationYear?: number | null })?.graduationYear || null;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-56 border-r bg-card flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center px-4 py-2 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="RecruitBoost" width={64} height={64} />
          <span className="text-xl font-bold text-foreground tracking-tight">RecruitBoost</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-6 pb-4">
        <p className="px-3 mb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Main
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium border-l-[3px] border-primary pl-[9px]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Card */}
      <div className="px-4 pb-5 pt-4 mt-auto border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground truncate">{userName}</p>
            {(sport || graduationYear) && (
              <p className="text-sm text-muted-foreground truncate">
                {[sport, graduationYear].filter(Boolean).join(" \u00B7 ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
