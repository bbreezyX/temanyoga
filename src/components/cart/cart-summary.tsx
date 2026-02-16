import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Receipt } from "lucide-react";

export function CartSummary() {
  const { cartTotal, cartCount } = useCart();

  return (
    <section className="rounded-[32px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[18px] tracking-tight font-extrabold text-slate-900">
          Ringkasan Pesanan
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] px-3 py-2 text-[12px] font-semibold text-[#5a4a3b]">
          <Receipt className="w-4 h-4 text-[#c85a2d]" />
          <span>{cartCount} barang</span>
        </span>
      </div>

      <dl className="mt-4 grid gap-2">
        <div className="flex items-center justify-between">
          <dt className="text-[14px] text-[#6b5b4b]">Subtotal</dt>
          <dd className="text-[14px] font-bold text-[#3f3328]">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[14px] text-[#6b5b4b]">Ongkir</dt>
          <dd className="text-[13px] font-semibold text-[#9a8772] italic">Dihitung saat checkout</dd>
        </div>
        <div className="h-px bg-[#e8dcc8] my-1"></div>
        <div className="flex items-center justify-between">
          <dt className="text-[14px] font-extrabold text-slate-900">Subtotal</dt>
          <dd className="text-[16px] font-black text-[#c85a2d]">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
      </dl>

      <Link
        href="/checkout"
        className="mt-4 relative overflow-hidden inline-flex items-center justify-center gap-2 min-h-[52px] w-full px-5 rounded-full bg-[#c85a2d] text-white font-semibold shadow-soft hover:bg-[#b04a25] transition-all group"
      >
        <span className="relative z-10">Lanjut ke Pembayaran</span>
        <ArrowRight className="w-[18px] h-[18px] relative z-10 transition-transform group-hover:translate-x-1" />
        <span className="absolute inset-0 opacity-20">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-white/60 skew-x-[-20deg] animate-shine"></span>
        </span>
      </Link>

      <p className="mt-3 text-[12px] text-[#7a6a58] leading-5">
        Anda akan melengkapi alamat pengiriman pada langkah berikutnya.
      </p>
    </section>
  );
}
