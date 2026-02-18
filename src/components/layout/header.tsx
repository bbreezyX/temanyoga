"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
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
  const { cartCount, cartTotal } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const toast = useToast();

  const handleCartClick = () => {
    if (cartCount === 0) {
      toast.custom(
        <div className="group relative flex w-full max-w-[calc(100vw-2rem)] sm:w-[420px] items-center gap-4 rounded-[28px] border border-border/80 bg-white/95 backdrop-blur-xl px-6 py-5 shadow-lift overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="toast-progress-bar" />
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-display text-[16px] font-black text-[#2d241c] leading-snug tracking-tight">
              Keranjang Kosong
            </h4>
            <p className="text-[14px] font-medium text-[#6b5b4b] mt-1 leading-snug">
              Yuk, pilih produk favoritmu!
            </p>
          </div>
          <button
            onClick={() => toast.dismiss("empty-cart-notification")}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[#6b5b4b] hover:bg-muted/50 hover:text-[#2d241c] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>,
        { id: "empty-cart-notification", duration: 4000 },
      );
      return;
    }

    toast.custom(
      <div className="group relative flex w-full max-w-[calc(100vw-2rem)] sm:w-[420px] items-center gap-4 rounded-[28px] border border-sage/30 bg-white/95 backdrop-blur-xl px-6 py-5 shadow-lift overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-transparent pointer-events-none" />
        <div className="toast-progress-bar toast-progress-bar--success" />
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage/10 text-sage border border-sage/20">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-display text-[16px] font-black text-[#2d241c] leading-snug tracking-tight">
            Keranjang Belanja
          </h4>
          <p className="text-[14px] font-medium text-[#6b5b4b] mt-1 leading-snug">
            {cartCount} Item •{" "}
            <span className="text-sage font-black">
              {formatCurrency(cartTotal)}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full h-11 px-6 font-black bg-sage hover:bg-[#2d241c] text-white text-[12px] uppercase tracking-widest flex-shrink-0 shadow-sm transition-all"
          asChild
          onClick={() => toast.dismiss("cart-notification")}
        >
          <Link href="/cart">Lihat</Link>
        </Button>
      </div>,
      { id: "cart-notification", duration: 5000 },
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none py-1 md:py-4">
      <div
        className={cn(
          "container mx-auto px-4 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] transform-gpu",
          isScrolled ? "max-w-4xl" : "max-w-6xl",
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-auto transform-gpu",
            isScrolled
              ? "h-12 md:h-14 px-5 md:px-6 rounded-full border border-primary/20 bg-background/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              : "h-14 md:h-16 px-4 md:px-0 border-transparent bg-transparent shadow-none",
          )}
        >
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-2.5 outline-none"
            >
              <div
                className={cn(
                  "relative flex items-center justify-center transition-all duration-500 transform-gpu",
                  isScrolled ? "scale-90" : "scale-100",
                )}
              >
                <BrandLogo size={isScrolled ? 42 : 56} />
              </div>
              <span
                className={cn(
                  "font-display font-medium tracking-tight text-foreground transition-all duration-500 transform-gpu",
                  isScrolled
                    ? "text-sm sm:text-base opacity-90"
                    : "hidden sm:inline text-xl md:text-2xl",
                )}
              >
                D`TEMAN <span className="font-black text-[#c85a2d]">YOGA</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative px-4 py-1.5 text-sm font-bold transition-all duration-300 rounded-full outline-none",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative rounded-full transition-all duration-300 active:scale-95 group",
                isScrolled
                  ? "h-9 w-9 bg-primary/5 hover:bg-primary/10"
                  : "h-11 w-11 hover:bg-foreground/5",
              )}
              onClick={handleCartClick}
            >
              <ShoppingCart
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  isScrolled ? "h-4 w-4" : "h-[22px] w-[22px]",
                )}
              />
              {cartCount > 0 && (
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
                  className={cn(
                    "md:hidden rounded-full transition-all duration-300 transition-colors focus-visible:ring-primary",
                    isScrolled
                      ? "h-9 w-9 bg-primary/5 hover:bg-primary/10"
                      : "h-11 w-11 hover:bg-foreground/5",
                  )}
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
                className="fixed top-4 right-4 h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] sm:max-w-sm border bg-background rounded-[2.5rem] shadow-lift p-0 overflow-hidden"
              >
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <div className="flex h-full flex-col py-10 px-8">
                  <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
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
                            "group flex items-center justify-between font-display text-4xl font-bold tracking-tighter transition-all animate-in slide-in-from-right duration-700 fill-mode-both",
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

                  <div className="mt-auto pt-10 pb-6 border-t border-border/40">
                    <p className="text-muted-foreground text-sm font-medium">
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
