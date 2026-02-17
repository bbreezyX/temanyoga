"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center gap-4 rounded-full text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
        isCollapsed ? "justify-center w-16 h-14 mx-auto" : "w-full px-5 py-3.5"
      )}
      onClick={() => signOut({ callbackUrl: "/login" })}
      title={isCollapsed ? "Keluar" : undefined}
    >
      <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
      {!isCollapsed && (
        <span className="font-semibold tracking-wide">Keluar</span>
      )}
    </button>
  );
}
