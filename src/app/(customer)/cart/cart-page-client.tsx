"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartPageSkeleton } from "./cart-page-skeleton";
import { useCart } from "@/contexts/cart-context";

export default function CartPageClient() {
  const { items, getItemKey, isLoaded } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isLoaded) {
    return <CartPageSkeleton showHeader={false} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <div className="animate-floatIn w-full max-w-md text-center">
          <div className="mx-auto mb-10 grid h-32 w-32 place-items-center rounded-[40px] bg-[#f5f1ed] transition-transform duration-500 hover:rotate-6">
            <ShoppingBag className="h-14 w-14 text-[#c85a2d]" />
          </div>
          <h2 className="mb-4 font-display text-4xl font-black text-[#2d241c]">
            Keranjang Kosong
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-[#6b5b4b]">
            Sepertinya Anda belum memilih barang. <br />
            Mari mulai perjalanan yoga Anda.
          </p>
          <Link
            href="/products"
            className="inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full bg-[#c85a2d] text-[15px] font-bold uppercase tracking-wide text-white shadow-lift transition-all hover:bg-[#b14f27] active:scale-[0.98]"
          >
            <span>Lihat Koleksi</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="items-start lg:grid lg:grid-cols-12 lg:gap-16">
      <div className="mb-12 flex flex-col lg:col-span-7 lg:mb-0">
        {items.map((item) => (
          <CartItemRow key={getItemKey(item)} item={item} />
        ))}
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-32">
        <div className="animate-floatIn" style={{ animationDelay: "150ms" }}>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
