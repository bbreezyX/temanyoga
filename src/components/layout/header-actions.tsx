"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { SheetTrigger, SheetTitle, Sheet } from "@/components/ui/sheet";

const SheetContent = dynamic(
  () => import("@/components/ui/sheet").then((mod) => mod.SheetContent),
  { ssr: false },
);

const NAV_LINKS = [
  { href: "/products", label: "Koleksi" },
  { href: "/#story", label: "Cerita Kami" },
  { href: "/track-order", label: "Lacak Pesanan" },
];

interface HeaderActionsProps {
  brand: ReactNode;
  mobileBrand: ReactNode;
}

export function HeaderActions({ brand, mobileBrand }: HeaderActionsProps) {
  const { cartCount, isLoaded } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-[#eadfce]/70 bg-white/95 shadow-soft"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-2 px-4 md:h-24 md:px-8">
        {brand}

        <div className="flex items-center gap-1.5 md:gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-sm font-semibold outline-none transition-colors duration-300",
                    isActive
                      ? "text-[#c85a2d]"
                      : "text-[#2d241c] hover:text-[#c85a2d]",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#c85a2d]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <span className="mx-1 hidden h-6 w-px bg-[#2d241c]/10 md:block" />

          <Link
            href="/cart"
            aria-label="Keranjang"
            className="group relative inline-flex h-10 items-center gap-2 rounded-full bg-[#c85a2d] px-3.5 text-white transition-all duration-300 hover:bg-[#b14f27] active:scale-95 md:h-11 md:px-4"
          >
            <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            {isLoaded && cartCount > 0 && (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-[#c85a2d]">
                {cartCount}
              </span>
            )}
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-[#2d241c] transition-colors duration-300 hover:bg-[#f5efe6] focus-visible:ring-primary md:hidden"
              >
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <span
                    className={cn(
                      "absolute h-0.5 w-5 bg-current transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
                      mobileOpen ? "rotate-45" : "-translate-y-1.5",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute h-0.5 w-5 bg-current transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
                      mobileOpen ? "opacity-0 scale-x-0" : "opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute h-0.5 w-5 bg-current transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
                      mobileOpen ? "-rotate-45" : "translate-y-1.5",
                    )}
                  />
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="fixed top-4 right-4 h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-[2.5rem] border bg-background p-0 shadow-lift sm:max-w-sm"
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex h-full flex-col px-8 py-10">
                <div className="mb-12 flex items-center justify-between">
                  {mobileBrand}
                </div>
                <nav className="flex flex-col gap-10">
                  {NAV_LINKS.map((link, idx) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex animate-in items-center justify-between fill-mode-both font-display text-4xl font-bold tracking-tighter transition-all duration-700 slide-in-from-right",
                          isActive
                            ? "text-primary"
                            : "text-foreground hover:text-primary",
                        )}
                        style={{ animationDelay: `${200 + idx * 100}ms` }}
                      >
                        {link.label}
                        <div
                          className={cn(
                            "h-2.5 w-2.5 rounded-full bg-primary transition-transform duration-300",
                            isActive
                              ? "scale-100"
                              : "scale-0 group-hover:scale-100",
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-border/40 pt-10 pb-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    © 2026 D`TEMAN YOGA
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
