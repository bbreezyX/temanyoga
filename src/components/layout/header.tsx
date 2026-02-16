"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/products", label: "Produk" },
  { href: "/track-order", label: "Cek Pesanan" },
];

export function Header() {
  const { cartCount, cartTotal } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleCartClick = () => {
    if (cartCount === 0) {
      toast.custom(
        (t) => (
          <div className="flex w-full min-w-[320px] max-w-md items-center gap-4 rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-lift backdrop-blur-xl animate-in slide-in-from-top duration-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-base font-bold text-foreground leading-tight">
                Keranjang Kosong
              </h4>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                Yuk, pilih produk favoritmu sekarang!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="ml-2 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Tutup
            </button>
          </div>
        ),
        {
          duration: 4000,
          id: "empty-cart-notification",
        },
      );
      return;
    }

    toast.custom(
      (t) => (
        <div className="flex w-full min-w-[320px] max-w-md items-center gap-4 rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-lift backdrop-blur-xl animate-in slide-in-from-bottom duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-base font-bold text-foreground leading-tight">
              Keranjang Belanja
            </h4>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {cartCount} Item •{" "}
              <span className="text-primary">{formatCurrency(cartTotal)}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1.5 ml-2">
            <Button
              size="sm"
              className="rounded-xl h-9 px-4 font-bold"
              asChild
              onClick={() => toast.dismiss(t)}
            >
              <Link href="/cart">Lihat</Link>
            </Button>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Tutup
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        id: "cart-notification",
      },
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      // Increase threshold effectively to 20px to prevent "shaking" near the top
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none py-4 md:py-6">
      <div
        className={cn(
          "container mx-auto px-4 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] transform-gpu",
          isScrolled ? "max-w-3xl" : "max-w-6xl",
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-auto transform-gpu",
            isScrolled
              ? "h-12 md:h-14 px-5 md:px-8 rounded-full border border-primary/20 bg-background/90 backdrop-blur-xl shadow-soft"
              : "h-14 md:h-16 px-4 md:px-0 border-transparent bg-transparent backdrop-blur-0 shadow-none",
          )}
        >
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-2.5 outline-none"
            >
              <div
                className={cn(
                  "relative flex items-center justify-center transition-all duration-500",
                  isScrolled ? "h-11 w-11" : "h-14 w-14",
                )}
              >
                <Image
                  src="/images/brand-logo.png"
                  alt="TemanYoga Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={cn(
                  "hidden sm:inline font-display font-medium tracking-tight text-foreground transition-all duration-500",
                  isScrolled ? "text-lg" : "text-xl md:text-2xl",
                )}
              >
                dTeman <span className="font-black text-[#c85a2d]">Yoga</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:text-primary focus-visible:text-primary outline-none"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative rounded-full transition-all duration-300 active:scale-95 group",
                isScrolled
                  ? "h-10 w-10 bg-primary/5 hover:bg-primary/10"
                  : "h-11 w-11 hover:bg-foreground/5",
              )}
              onClick={handleCartClick}
            >
              <ShoppingCart
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  isScrolled ? "h-5 w-5" : "h-[22px] w-[22px]",
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
                  className="md:hidden h-10 w-10 rounded-full hover:bg-primary/10 transition-colors focus-visible:ring-primary"
                >
                  <Menu
                    className={cn(
                      "h-5 w-5 transition-all",
                      mobileOpen && "scale-0 opacity-0",
                    )}
                  />
                  <X
                    className={cn(
                      "absolute h-5 w-5 transition-all scale-0 opacity-0",
                      mobileOpen && "scale-100 opacity-100",
                    )}
                  />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="fixed top-4 right-4 h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] sm:max-w-sm border bg-background/95 backdrop-blur-2xl rounded-[2.5rem] shadow-lift p-0 overflow-hidden"
              >
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <div className="flex h-full flex-col py-10 px-8">
                  <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-16 w-16 items-center justify-center rotate-3 transition-transform hover:rotate-6">
                        <Image
                          src="/images/brand-logo.png"
                          alt="TemanYoga Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-display text-2xl font-medium tracking-tighter">
                        dTeman{" "}
                        <span className="font-black text-[#c85a2d]">Yoga</span>
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-10">
                    {NAV_LINKS.map((link, idx) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center justify-between font-display text-4xl font-bold tracking-tighter transition-all hover:text-primary animate-in slide-in-from-right duration-700 fill-mode-both"
                        style={{ animationDelay: `${200 + idx * 100}ms` }}
                      >
                        {link.label}
                        <div className="h-2.5 w-2.5 rounded-full bg-primary scale-0 transition-transform duration-300 group-hover:scale-100" />
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto pt-10 pb-6 border-t border-border/40">
                    <p className="text-muted-foreground text-sm font-medium">
                      © 2026 dTeman Yoga
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
