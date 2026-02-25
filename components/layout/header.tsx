import Link from "next/link";
import { Clock } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  return (
    <header className="h-11 border-b bg-card flex items-center justify-between px-6">
      {/* Left side intentionally empty - page title rendered by each page */}
      <div />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          href="/activities"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Clock className="w-4 h-4" />
          <span>Activity History</span>
        </Link>

        <div className="h-5 w-px bg-border" />

        <UserMenu />
      </div>
    </header>
  );
}
