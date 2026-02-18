import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function CartSummary() {
  const { cartTotal, cartCount } = useCart();

  return (
    <section className="rounded-[40px] bg-[#f9f9f9] border border-[#e8dcc8]/60 p-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e8dcc8]/40">
        <h2 className="font-display text-[22px] tracking-tight font-black text-[#2d241c]">
          Ringkasan
        </h2>
        <span className="text-[13px] font-bold text-[#6b5b4b]">
          {cartCount} Item
        </span>
      </div>

      <dl className="grid gap-4">
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-[#6b5b4b]">Subtotal</dt>
          <dd className="text-[15px] font-bold text-[#3f3328]">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-[#6b5b4b]">Ongkir</dt>
          <dd className="text-[14px] font-medium text-[#c85a2d] italic">
            Dihitung saat checkout
          </dd>
        </div>
        <div className="pt-6 mt-2 border-t border-[#e8dcc8]/40 flex items-center justify-between">
          <dt className="text-[16px] font-bold text-[#2d241c]">Total</dt>
          <dd className="text-2xl font-black text-[#c85a2d] tracking-tight">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-10 space-y-4">
        <Link
          href="/checkout"
          className="group relative flex items-center justify-center gap-3 min-h-[64px] w-full px-8 rounded-full bg-[#c85a2d] text-white font-black text-[16px] shadow-lift hover:bg-[#2d241c] hover:shadow-none transition-all active:scale-[0.98]"
        >
          <span>Lanjut ke Pembayaran</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="text-center text-[12px] text-[#9a8772] font-medium px-4 leading-relaxed">
          Pajak dan biaya pengiriman akan dikonfirmasi pada langkah akhir.
        </p>
      </div>
    </section>
  );
}
