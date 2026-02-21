import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Instagram, MessageCircle, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <footer className="bg-white text-[#2d241c] pt-24 pb-12 relative overflow-hidden selection:bg-[#c85a2d] selection:text-white border-t border-[#e8dcc8]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Branding Column */}
          <div className="lg:col-span-5 flex flex-col items-start gap-8">
            <div className="flex items-center gap-4 group">
              <div className="relative transition-transform duration-500 group-hover:rotate-6">
                <BrandLogo size={64} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-3xl font-black tracking-tight leading-none">
                  D`TEMAN <span className="text-[#c85a2d]">YOGA</span>
                </span>
                <span className="text-[#c85a2d] font-serif italic text-sm mt-1 opacity-80">
                  Dibuat dengan Hati, Untuk Jiwa.
                </span>
              </div>
            </div>
            
            <p className="text-[#6b5b4b] text-lg leading-relaxed max-w-sm mt-4 font-medium">
              Asana Charm: Menciptakan koneksi emosional dalam setiap langkah 
              perjalanan yoga Anda dengan ketenangan dan senyuman.
            </p>

            <div className="flex flex-col gap-2 mt-4 text-[10px] uppercase tracking-[0.3em] font-bold text-[#2d241c]/30">
               <span>Handmade in Indonesia • Est. 2026</span>
               <span>Artisanal Crochet • Limited Batches</span>
            </div>
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 h-full w-px bg-[#e8dcc8] self-stretch justify-self-center opacity-50"></div>

          {/* Navigation & Help Links */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-[#c85a2d]">Eksplorasi</h4>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-sm font-bold text-[#6b5b4b] hover:text-[#2d241c] transition-all w-fit"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c85a2d] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-col gap-8">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-[#c85a2d]">Bantuan</h4>
              <nav className="flex flex-col gap-4">
                {HELP_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-sm font-bold text-[#6b5b4b] hover:text-[#2d241c] transition-all w-fit"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c85a2d] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Social & Contact */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-[#c85a2d]">Koneksi</h4>
            <div className="flex flex-wrap gap-4">
               {[
                 { icon: Instagram, label: "Instagram", href: "#" },
                 { icon: MessageCircle, label: "WhatsApp", href: "#" },
                 { icon: Send, label: "Contact", href: "#" }
               ].map((social) => (
                 <Link
                   key={social.label}
                   href={social.href}
                   className="group relative w-12 h-12 rounded-full border border-[#e8dcc8] flex items-center justify-center transition-all duration-500 hover:border-[#c85a2d] hover:bg-[#c85a2d]"
                 >
                   <social.icon className="w-5 h-5 text-[#6b5b4b] group-hover:text-white transition-colors" />
                   <span className="sr-only">{social.label}</span>
                 </Link>
               ))}
            </div>
            <div className="mt-4 p-6 rounded-[2rem] bg-[#f9f9f9] border border-[#e8dcc8]/60 flex flex-col gap-4">
               <p className="text-xs font-bold text-[#6b5b4b] leading-relaxed uppercase tracking-widest">
                  Ada pertanyaan? Kami siap membantu perjalanan Anda.
               </p>
               <Link href="/contact" className="group flex items-center justify-between text-sm font-black uppercase tracking-widest hover:text-[#c85a2d] transition-colors">
                  Hubungi Sekarang
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-[#e8dcc8] flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#2d241c]/30">
          <p>
            &copy; {new Date().getFullYear()} D`TEMAN YOGA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-[#2d241c]/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#2d241c]/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
