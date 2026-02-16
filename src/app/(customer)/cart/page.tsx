"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Keranjang Kosong</h1>
        <p className="text-muted-foreground">
          Belum ada produk di keranjang belanja Anda.
        </p>
        <Button asChild>
          <Link href="/products">Lihat Produk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item, i) => (
            <div key={item.productId}>
              <CartItemRow item={item} />
              {i < items.length - 1 && <Separator />}
            </div>
          ))}
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
