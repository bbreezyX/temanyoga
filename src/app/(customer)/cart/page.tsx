"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, getItemKey, isLoaded, cartTotal } = useCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isLoaded) {
    return (
      <div className="bg-white min-h-screen text-[#2d241c] font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-floatIn">
          <div className="h-32 w-32 rounded-[40px] bg-[#f5f1ed] animate-pulse mx-auto mb-10" />
          <div className="h-10 w-56 rounded-full bg-[#f5f1ed] animate-pulse mx-auto mb-4" />
          <div className="h-5 w-72 rounded-full bg-[#f5f1ed] animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen text-[#2d241c] font-sans flex flex-col items-center justify-center p-6">
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
            className="inline-flex items-center justify-center gap-3 w-full min-h-[60px] rounded-full bg-[#c85a2d] text-white font-black text-[16px] uppercase tracking-widest shadow-lift hover:bg-[#2d241c] transition-all active:scale-[0.98]"
          >
            <span>Lihat Koleksi</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-[#2d241c] font-sans">
      <div
        className="flex-1 px-6 md:px-12 pb-32 lg:pb-24 w-full max-w-7xl mx-auto"
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

      {/* Sticky mobile checkout bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#e8dcc8] bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8772] leading-none">
              Total
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#c85a2d] leading-none">
              {formatCurrency(cartTotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full bg-[#c85a2d] text-white font-black text-[14px] uppercase tracking-widest shadow-lift-sm hover:bg-[#2d241c] transition-all active:scale-[0.98]"
          >
            <span>Lanjut ke Pembayaran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
