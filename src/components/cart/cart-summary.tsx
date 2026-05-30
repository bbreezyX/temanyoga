import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export function CartSummary() {
  const { cartTotal, cartCount } = useCart();

  return (
    <section className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-soft md:rounded-[40px]">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h2 className="font-serif text-lg font-semibold text-[#2d241c]">Ringkasan</h2>
        <span className="rounded-full bg-[#faf6f0] px-3 py-1 text-[12px] font-semibold text-[#6b5b4b]">
          {cartCount} item
        </span>
      </div>

      <dl className="space-y-3 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-5 md:rounded-[32px]">
        <div className="flex items-center justify-between">
          <dt className="text-[14px] text-[#6b5b4b]">Subtotal</dt>
          <dd className="text-[14px] font-semibold text-[#2d241c]">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[14px] text-[#6b5b4b]">Ongkir</dt>
          <dd className="text-[13px] font-medium italic text-[#c85a2d]">
            Dihitung saat checkout
          </dd>
        </div>
        <div className="flex items-end justify-between border-t border-[#e8dcc8] pt-3">
          <dt className="text-[15px] font-bold text-[#2d241c]">Total</dt>
          <dd className="text-[26px] font-extrabold tracking-tight text-[#c85a2d]">
            {formatCurrency(cartTotal)}
          </dd>
        </div>
      </dl>

      <div className="space-y-3 px-1 pb-1 pt-3">
        <Link
          href="/checkout"
          className="group relative flex min-h-[58px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#c85a2d] px-6 text-[15px] font-bold uppercase tracking-wide text-white shadow-lift transition-all hover:bg-[#b14f27] active:scale-[0.98]"
        >
          <span>Lanjut ke Pembayaran</span>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1.5" />
        </Link>
        <p className="px-4 text-center text-[12px] font-medium leading-relaxed text-[#9a8772]">
          Ongkos kirim & kupon dikonfirmasi pada langkah checkout.
        </p>
      </div>
    </section>
  );
}
