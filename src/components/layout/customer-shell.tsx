"use client";

import { CartProvider } from "@/contexts/cart-context";
import { Header } from "@/components/layout/header";

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
    </CartProvider>
  );
}
