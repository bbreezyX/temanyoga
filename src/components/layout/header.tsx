"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { SheetTrigger, SheetTitle, Sheet } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";

const SheetContent = dynamic(
  () => import("@/components/ui/sheet").then((mod) => mod.SheetContent),
  { ssr: false },
);

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/track-order", label: "Cek Pesanan" },
];

export function Header() {
  const { cartCount, isLoaded } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleCartClick = () => {
    router.push("/cart");
  };

  return (
    <header className="pointer-events-none sticky top-0 z-50 w-full py-3 md:py-4">
      <div className="mx-auto w-full max-w-5xl px-4">
        {/* Consistent floating pill — same look at top and while scrolling */}
        <div className="pointer-events-auto relative flex h-14 items-center justify-between rounded-full border border-black/5 bg-background/80 px-5 shadow-[0_8px_32px_rgba(32,32,32,0.08)] backdrop-blur-lg md:h-16 md:px-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-2.5 outline-none"
            >
              <div className="relative flex items-center justify-center">
                <BrandLogo size={44} />
              </div>
              <span className="hidden font-display text-lg font-medium tracking-tight text-foreground sm:inline md:text-xl">
                D`TEMAN <span className="font-black text-[#c85a2d]">YOGA</span>
              </span>
            </Link>
          </div>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative rounded-full px-4 py-1.5 text-sm font-bold outline-none transition-all duration-300",
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="group relative h-10 w-10 rounded-full transition-all duration-300 hover:bg-primary/5 active:scale-95"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              {isLoaded && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-bold text-primary-foreground shadow-md ring-2 ring-background">
                  {cartCount}
                </Badge>
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-colors duration-300 focus-visible:ring-primary md:hidden"
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
                    <div className="flex items-center gap-3">
                      <div className="relative flex rotate-3 items-center justify-center transition-transform hover:rotate-6">
                        <BrandLogo size={64} />
                      </div>
                      <span className="font-display text-2xl font-medium tracking-tighter">
                        dTeman{" "}
                        <span className="font-black text-[#c85a2d]">Yoga</span>
                      </span>
                    </div>
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
      </div>
    </header>
  );
}
