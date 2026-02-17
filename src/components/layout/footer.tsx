import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BrandLogo size={56} />
              </div>
              <p className="text-xl font-medium tracking-tight text-slate-900">
                dTeman <span className="font-black text-[#c85a2d]">Yoga</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Asana Charm: Menciptakan koneksi emosional dalam setiap langkah 
              perjalanan yoga Anda dengan ketenangan dan senyuman.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Tautan
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-[#c85a2d] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-[#c85a2d] transition-colors"
              >
                Semua Produk
              </Link>
              <Link
                href="/track-order"
                className="text-sm text-muted-foreground hover:text-[#c85a2d] transition-colors"
              >
                Lacak Pesanan
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Hubungi Kami
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ada pertanyaan? Hubungi kami melalui kanal media sosial kami untuk
              respon cepat.
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} D`TEMAN YOGA. Semua hak dilindungi.
          </p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-foreground">
              Instagram
            </span>
            <span className="cursor-pointer hover:text-foreground">
              WhatsApp
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
