import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Instagram, MessageCircle, Send, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Semua Produk" },
  { href: "/track-order", label: "Lacak Pesanan" },
];

const HELP_LINKS = [
  { href: "/faq", label: "Pertanyaan Umum" },
  { href: "/shipping", label: "Pengiriman" },
  { href: "/contact", label: "Hubungi Kami" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#e8dcc8] bg-white pt-20 pb-10 text-[#2d241c] selection:bg-[#c85a2d] selection:text-white md:pt-24 md:pb-12">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Branding Column */}
          <div className="flex flex-col items-start gap-6 lg:col-span-5">
            <div className="group flex items-center gap-4">
              <div className="relative transition-transform duration-500 group-hover:rotate-3">
                <BrandLogo size={56} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-[2rem] leading-none font-semibold tracking-[-0.03em] md:text-[2.25rem]">
                  D`TEMAN <span className="text-[#c85a2d]">YOGA</span>
                </span>
                <span className="text-sm font-medium italic text-[#a65736]">
                  Dibuat dengan Hati, Untuk Jiwa.
                </span>
              </div>
            </div>

            <p className="max-w-md text-base leading-7 text-[#6b5b4b] md:text-[17px]">
              Asana Charm: Menciptakan koneksi emosional dalam setiap langkah 
              perjalanan yoga Anda dengan ketenangan dan senyuman.
            </p>

            <div className="mt-2 flex flex-col gap-2 text-[11px] font-medium tracking-[0.18em] text-[#6b5b4b]/75 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
               <span>Handmade in Indonesia</span>
               <span>Est. 2026</span>
               <span>Artisanal Crochet</span>
               <span>Limited Batches</span>
            </div>
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden h-full w-px self-stretch justify-self-center bg-[#e8dcc8] opacity-50 lg:col-span-1 lg:block"></div>

          {/* Navigation & Help Links */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:col-span-3 lg:gap-8">
            <div className="flex flex-col gap-5">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a65736]">Eksplorasi</h4>
              <nav className="flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex w-fit items-center gap-2 text-[15px] font-medium leading-6 text-[#6b5b4b] transition-colors hover:text-[#2d241c]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#c85a2d] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a65736]">Bantuan</h4>
              <nav className="flex flex-col gap-3">
                {HELP_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex w-fit items-center gap-2 text-[15px] font-medium leading-6 text-[#6b5b4b] transition-colors hover:text-[#2d241c]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#c85a2d] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a65736]">Koneksi</h4>
            <p className="max-w-xs text-sm leading-6 text-[#6b5b4b]">
              Ikuti kabar terbaru, tanya soal produk, atau ngobrol langsung soal pesanan Anda.
            </p>
            <div className="flex flex-wrap gap-3">
               {[
                 { icon: Instagram, label: "Instagram", href: "#" },
                 { icon: MessageCircle, label: "WhatsApp", href: "#" },
                 { icon: Send, label: "Contact", href: "#" }
               ].map((social) => (
                 <Link
                   key={social.label}
                   href={social.href}
                   className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e8dcc8] bg-white transition-all duration-300 hover:border-[#c85a2d] hover:bg-[#c85a2d]"
                 >
                   <social.icon className="h-4.5 w-4.5 text-[#6b5b4b] transition-colors group-hover:text-white" />
                   <span className="sr-only">{social.label}</span>
                 </Link>
               ))}
            </div>
            <div className="mt-2 flex flex-col gap-4 rounded-[1.75rem] border border-[#e8dcc8]/70 bg-[#fbf8f4] p-6">
               <p className="text-sm leading-6 text-[#6b5b4b]">
                  Ada pertanyaan? Kami siap membantu perjalanan Anda.
               </p>
               <Link href="/contact" className="group flex items-center justify-between text-sm font-semibold text-[#2d241c] transition-colors hover:text-[#c85a2d]">
                  Hubungi kami
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col gap-5 border-t border-[#e8dcc8] pt-8 text-sm text-[#6b5b4b] md:mt-20 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} D`TEMAN YOGA. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-[#2d241c]">Kebijakan Privasi</Link>
            <Link href="/terms" className="transition-colors hover:text-[#2d241c]">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
