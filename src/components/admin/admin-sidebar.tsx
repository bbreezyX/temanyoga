"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground relative z-50 shadow-2xl sidebar-transition border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="flex h-20 items-center gap-3 px-8 shrink-0 border-b border-sidebar-border">
        <span className="font-display text-xl font-black tracking-tight uppercase whitespace-nowrap text-sidebar-foreground">
          TemanYoga
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-1.5 px-4 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-full px-5 py-3.5 transition-all duration-300",
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
              <span
                className={cn(
                  "font-semibold tracking-wide transition-colors duration-300",
                  active ? "font-bold" : "",
                )}
              >
                {item.label}
              </span>
              {item.label === "Orders" && (
                <span className="ml-auto rounded-full bg-sidebar-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-sidebar-primary ring-1 ring-sidebar-primary/30">
                  12
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto p-4 border-t border-sidebar-border bg-sidebar/50">
        <LogoutButton />
      </div>
    </aside>
  );
}
