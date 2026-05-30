"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { items, getItemKey, isLoaded } = useCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isLoaded) {
    return (
      <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24">
        <div className="flex-1 px-5 md:px-12 pb-24 w-full max-w-7xl mx-auto">
          <section className="pt-12 md:pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <Skeleton className="h-4 w-28 rounded-full bg-[#dcd0bf] mb-4" />
                <Skeleton className="h-12 md:h-16 w-72 max-w-full rounded-3xl bg-[#dcd0bf]" />
              </div>
              <Skeleton className="h-5 w-44 rounded-full bg-[#dcd0bf]" />
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
              <div className="lg:col-span-7 flex flex-col gap-5 mb-12 lg:mb-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[28px] md:rounded-[32px] border border-[#eadfce] bg-white shadow-soft p-5 md:p-6"
                  >
                    <div className="flex gap-5">
                      <Skeleton className="h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-[20px] bg-[#f5f1ed]" />
                      <div className="flex-1 min-w-0 space-y-3 pt-1">
                        <Skeleton className="h-5 w-2/3 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded-full" />
                      </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-[#eadfce] flex items-center justify-between">
                      <Skeleton className="h-11 w-32 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 lg:sticky lg:top-32">
                <div className="rounded-[28px] md:rounded-[40px] border border-[#eadfce] bg-white p-3 shadow-soft">
                  <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <div className="rounded-[24px] md:rounded-[32px] border border-[#eadfce] bg-[#faf6f0] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-4 w-28 rounded-full" />
                    </div>
                    <div className="border-t border-[#e8dcc8] pt-4 flex items-center justify-between">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                  </div>
                  <div className="px-1 pt-3 pb-1">
                    <Skeleton className="h-[58px] w-full rounded-full bg-[#dcd0bf]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans flex flex-col items-center justify-center p-6 md:-mt-24 md:pt-24">
        <div className="max-w-md w-full text-center animate-floatIn">
          <div className="h-32 w-32 rounded-[40px] bg-[#f5f1ed] grid place-items-center mx-auto mb-10 transition-transform hover:rotate-6 duration-500">
            <ShoppingBag className="h-14 w-14 text-[#c85a2d]" />
          </div>
          <h1 className="font-display text-4xl font-black text-[#2d241c] mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-[#6b5b4b] mb-10 leading-relaxed text-lg">
            Sepertinya Anda belum memilih barang. <br />
            Mari mulai perjalanan yoga Anda.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-3 w-full min-h-[58px] rounded-full bg-[#c85a2d] text-white font-bold text-[15px] uppercase tracking-wide shadow-lift hover:bg-[#b14f27] transition-all active:scale-[0.98]"
          >
            <span>Lihat Koleksi</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24">
      <div
        className="flex-1 px-5 md:px-12 pb-24 w-full max-w-7xl mx-auto"
        id="top"
      >
        <section className="pt-12 md:pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-[#c85a2d]" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                  Pilihan Anda
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[#2d241c]">
                Keranjang Belanja
              </h1>
            </div>
            <Link
              href="/products"
              className="group self-start md:self-end inline-flex items-center gap-3 text-[14px] font-bold text-[#6b5b4b] hover:text-[#c85a2d] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali Berbelanja</span>
            </Link>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 flex flex-col mb-12 lg:mb-0">
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
        </section>
      </div>
    </div>
  );
}
