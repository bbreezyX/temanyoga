"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      className="flex w-full items-center gap-4 rounded-full px-5 py-3.5 text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
      <span className="font-semibold tracking-wide">Logout</span>
    </button>
  );
}
