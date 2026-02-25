"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = session?.user?.name || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 hover:bg-accent rounded-lg px-3 py-2 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{userName}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg border shadow-lg py-1 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            Settings
          </Link>
          <div className="border-t my-1" />
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
