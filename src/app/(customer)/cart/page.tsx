"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[32px] p-8 shadow-soft text-center ring-1 ring-[#e8dcc8] max-w-md w-full animate-floatIn">
          <div className="h-20 w-20 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-[#c85a2d]" />
          </div>
          <h1 className="font-display text-[24px] font-bold text-slate-900 mb-2">
            Keranjang Kosong
          </h1>
          <p className="text-[#6b5b4b] mb-8 leading-relaxed">
            Belum ada produk di keranjang belanja Anda. Yuk, mulai cari
            peralatan yoga terbaikmu!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[56px] rounded-full bg-[#c85a2d] text-white font-bold text-[16px] shadow-soft hover:bg-[#b04a25] transition-all"
          >
            <span>Lihat Koleksi</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans">
      <div
        className="flex-1 overflow-y-auto px-6 md:px-8 pb-16 w-full max-w-6xl mx-auto"
        id="top"
      >
        <section className="pt-8 md:pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="min-w-0">
              <h1 className="font-display text-[28px] md:text-[36px] leading-[1.1] tracking-tight font-black text-slate-900">
                Keranjang Belanja
              </h1>
              <p className="mt-2 text-[15px] md:text-[16px] text-[#6b5b4b]">
                Tinjau barang pilihanmu, sesuaikan jumlah, dan lanjut ke pembayaran.
              </p>
            </div>
            <Link
              href="/products"
              className="group self-start md:self-end min-h-[48px] inline-flex items-center gap-2 px-6 rounded-full bg-gradient-to-r from-[#c85a2d] to-[#d46a3a] text-white text-[14px] font-bold shadow-lg shadow-[#c85a2d]/20 hover:shadow-xl hover:shadow-[#c85a2d]/30 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Lanjut Belanja</span>
            </Link>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            <div className="lg:col-span-8 flex flex-col gap-5 mb-10 lg:mb-0">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="animate-floatIn" style={{ animationDelay: '150ms' }}>
                <CartSummary />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
