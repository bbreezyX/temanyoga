"use client";

import { Menu, Calendar, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { NotificationDropdown } from "./notification-dropdown";
import { useSession, signOut } from "next-auth/react";
import { useSidebar } from "@/contexts/sidebar-context";

export function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin User";
  const userRole = session?.user?.role || "OWNER ADMIN";
  const { setIsMobileOpen } = useSidebar();

  const today = new Date().toLocaleDateString("id-ID", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex h-20 shrink-0 items-center justify-between bg-card px-6 lg:px-10 shadow-sm border-b border-border z-40 sticky top-0">
      {/* Mobile Menu */}
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-brown hover:bg-cream"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 border-none bg-dark-brown"
          >
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-dark-brown uppercase">
            TemanYoga
          </span>
        </div>
      </div>

      {/* Date - Desktop Only */}
      <div className="hidden lg:flex items-center gap-2 text-warm-gray">
        <Calendar className="h-5 w-5" />
        <span className="text-sm font-semibold">{today}</span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 lg:gap-8">
        <NotificationDropdown />

        <div className="hidden sm:block h-8 w-[1px] bg-warm-sand/50"></div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-dark-brown leading-tight">
              {userName}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-sage">
              {userRole}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10 ring-2 ring-terracotta/20">
            <UserIcon className="h-6 w-6 text-terracotta" />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-warm-gray transition-all hover:bg-terracotta/10 hover:text-terracotta"
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
