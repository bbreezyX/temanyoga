import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CartPageHeader() {
  return (
    <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="h-px w-8 bg-[#c85a2d]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c85a2d]">
            Pilihan Anda
          </span>
        </div>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-[#2d241c] md:text-5xl lg:text-6xl">
          Keranjang Belanja
        </h1>
      </div>
      <Link
        href="/products"
        className="group inline-flex items-center gap-3 self-start text-[14px] font-bold text-[#6b5b4b] transition-colors hover:text-[#c85a2d] md:self-end"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Kembali Berbelanja</span>
      </Link>
    </div>
  );
}
