"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Puzzle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import { apiFetch } from "@/lib/api-client";
import { useSidebar } from "@/contexts/sidebar-context";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { AdminDashboardStats } from "@/types/api";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/accessories", label: "Aksesoris", icon: Puzzle },
  { href: "/admin/coupons", label: "Kupon", icon: Ticket },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const { isCollapsed, toggleSidebar, setIsMobileOpen } = useSidebar();

  useEffect(() => {
    const fetchPendingCount = async () => {
      const res = await apiFetch<AdminDashboardStats>("/api/admin/dashboard");
      if (res.success) {
        setPendingCount(res.data.pendingPayments);
      }
    };
    fetchPendingCount();
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground relative z-50 shadow-2xl sidebar-transition border-r border-sidebar-border transition-all duration-300",
        "w-72 lg:w-72",
        isCollapsed && "lg:!w-20",
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-24 items-center gap-3 shrink-0 border-b border-sidebar-border transition-all duration-300",
          isCollapsed ? "lg:justify-center lg:px-2" : "px-8",
        )}
      >
        <BrandLogo size={isCollapsed ? 42 : 48} />
        {!isCollapsed && (
          <span className="font-display text-lg font-medium tracking-tight whitespace-nowrap text-sidebar-foreground">
            dTeman <span className="font-black text-[#c85a2d]">Yoga</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-1.5 px-2 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-4 rounded-full transition-all duration-300",
                isCollapsed
                  ? "lg:justify-center lg:px-0 lg:py-3.5 lg:w-16 lg:mx-auto"
                  : "",
                "px-5 py-3.5",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/10 scale-[1.02]"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
                )}
              />
              {!isCollapsed && (
                <>
                  <span
                    className={cn(
                      "font-semibold tracking-wide transition-colors duration-300",
                      active ? "font-bold" : "",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.label === "Pesanan" &&
                    pendingCount !== null &&
                    pendingCount > 0 && (
                      <span className="ml-auto rounded-full bg-sidebar-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-sidebar-primary ring-1 ring-sidebar-primary/30">
                        {pendingCount}
                      </span>
                    )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button - Desktop Only */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-24 -right-3 h-6 w-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 z-50 hidden lg:flex",
          "ring-2 ring-sidebar-background",
        )}
        title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Footer / Logout */}
      <div
        className={cn(
          "mt-auto p-4 border-t border-sidebar-border bg-sidebar/50 transition-all duration-300",
          isCollapsed && "lg:p-2",
        )}
      >
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
