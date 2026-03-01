import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Sparkles, ArrowRight, ArrowUpRight, MoveRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";

const SITE_URL = "https://ditemaniyoga.com";

export const metadata: Metadata = {
  title: "Boneka Rajut Yoga Premium",
  description:
    "Lebih dari sekadar boneka rajut. Sebuah simbol kehadiran, ketenangan, dan teman setia dalam setiap perjalanan yoga Anda.",
  alternates: {
    canonical: SITE_URL,
  },
};

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: { orderBy: { order: "asc" } } },
    });
    return products;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "D`TEMAN YOGA",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/brand-logo.png`,
        },
        description:
          "Boneka rajut yoga premium handmade oleh pengrajin lokal Indonesia. Simbol kedamaian dan teman setia dalam setiap asana.",
      },
    ],
  };

  return (
    <div className="min-h-screen text-[#3f3328] font-sans selection:bg-[#c85a2d] selection:text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 
        HERO SECTION: Organic Modern & Artisan
        Refined typography, overlapping elements, and textural depth.
      */}
      <section className="-mt-[6rem] pt-[6rem] relative min-h-[100dvh] w-full bg-white text-[#3f3328] overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-12 min-h-[100dvh] max-w-[1800px] mx-auto px-6 md:px-12 pt-24 pb-12 items-center">
          {/* Typography & Content - Left Side */}
          <div className="lg:col-span-7 flex flex-col justify-center lg:pr-12 xl:pr-24">
            {/* Tagline */}
            <div className="relative inline-flex items-center gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
              <span className="w-8 sm:w-16 h-[2px] bg-[#c85a2d]"></span>
              <span className="text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-[#c85a2d]">
                Handmade in Indonesia • Est. 2026
              </span>
            </div>

            {/* Main Headline (SEO optimized) */}
            <h1 className="sr-only">
              Boneka Rajut Yoga Premium: Modern Amigurumi
            </h1>
            <div
              aria-hidden="true"
              className="relative font-display text-[15vw] sm:text-[13vw] lg:text-[10vw] xl:text-[160px] leading-[0.8] font-black tracking-[-0.04em] text-[#2d241c] mb-6 sm:mb-10 mix-blend-darken animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 fill-mode-both"
            >
              MODERN
              <span className="block ml-[0.5em] sm:ml-[1.5em] -mt-[0.3em] sm:-mt-[0.25em] text-[#c85a2d] font-serif italic font-medium tracking-normal text-[0.8em] sm:text-[0.6em]">
                Amigurumi
              </span>
            </div>

            {/* Description */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
              <div className="hidden sm:block w-px bg-[#c85a2d]/30 h-auto self-stretch"></div>
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-[#6b5b4b] leading-relaxed max-w-xl text-balance">
                Lebih dari sekadar boneka rajut. Sebuah simbol kehadiran,
                ketenangan, dan teman setia dalam setiap perjalanan yoga Anda.
                <span className="block mt-4 text-[#c85a2d] font-serif italic text-xl sm:text-2xl">
                  Dibuat dengan hati, untuk jiwa.
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-4 text-lg font-black uppercase tracking-widest text-[#2d241c] hover:text-[#c85a2d] transition-colors"
              >
                <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#2d241c] origin-left group-hover:scale-x-0 transition-transform duration-500"></div>
                <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#c85a2d] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <span>Eksplorasi Kurasi</span>
                <div className="w-10 h-10 rounded-full border border-[#2d241c] group-hover:border-[#c85a2d] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>

              <Link
                href="#story"
                className="group inline-flex items-center gap-2 text-base font-bold text-[#6b5b4b] uppercase tracking-widest hover:text-[#2d241c] transition-colors"
              >
                <span>Cerita Kami</span>
                <span className="block w-1.5 h-1.5 rounded-full bg-[#c85a2d] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
            </div>
          </div>

          {/* Image Composition - Right Side */}
          <div className="mt-12 lg:mt-0 lg:col-span-5 relative h-[60vh] lg:h-[85vh] w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
            {/* Main Image Container */}
            <div className="relative w-full h-full max-w-[600px]">
              {/* Backing Shape (Solid) */}
              <div className="absolute top-[10%] right-[5%] w-[90%] h-[80%] bg-[#e8dcc8] rounded-t-[200px] rounded-b-[40px] transform rotate-3"></div>

              {/* Image Mask (Arch) */}
              <div className="absolute inset-0 z-10 overflow-hidden rounded-t-[300px] rounded-b-[40px] shadow-2xl shadow-[#3f3328]/10 group">
                <Image
                  src="/images/crochet.png"
                  alt="Yoga Companion Amigurumi"
                  fill
                  priority
                  className="object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Subtle Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3f3328]/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-[#f5f1ed] p-6 pr-10 rounded-tr-[40px] shadow-lg border border-[#e8dcc8]">
                <div className="flex flex-col">
                  <span className="font-display text-5xl font-black text-[#c85a2d] leading-none">
                    100%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3f3328] mt-2">
                    Cotton Milk Premium
                  </span>
                </div>
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#c85a2d]"></div>
              </div>

              {/* Decorative "Sticker" */}
              <div className="absolute top-12 -right-4 md:-right-8 z-30 w-20 h-20 md:w-24 md:h-24 bg-[#2d241c] rounded-full flex items-center justify-center text-[#f5f1ed] text-center animate-[spin_10s_linear_infinite]">
                <svg
                  viewBox="0 0 100 100"
                  width="100"
                  height="100"
                  className="w-full h-full absolute inset-0"
                >
                  <path
                    id="curve"
                    d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0"
                    fill="transparent"
                  />
                  <text className="text-[11px] font-bold uppercase tracking-widest fill-current">
                    <textPath href="#curve" startOffset="0%">
                      • Authentic • Mindful • Crafted •
                    </textPath>
                  </text>
                </svg>
                <Sparkles className="w-6 h-6 text-[#c85a2d]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        MARQUEE SEPARATOR - Replaced with Floating Text Stream
      */}
      <div className="w-full bg-white relative z-10 py-12 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent z-10"></div>
        <div className="animate-marquee-ltr flex items-center gap-24 min-w-full opacity-10">
          <span className="text-[120px] font-display font-black leading-none text-[#2d241c] whitespace-nowrap">
            MINDFULNESS
          </span>
          <span
            className="text-[120px] font-display font-black leading-none text-transparent stroke-text whitespace-nowrap"
            style={{ WebkitTextStroke: "2px #2d241c" }}
          >
            HANDMADE
          </span>
          <span className="text-[120px] font-display font-black leading-none text-[#2d241c] whitespace-nowrap">
            SERENITY
          </span>
          <span
            className="text-[120px] font-display font-black leading-none text-transparent stroke-text whitespace-nowrap"
            style={{ WebkitTextStroke: "2px #2d241c" }}
          >
            CONNECTION
          </span>
        </div>
      </div>

      {/* 
        FEATURED COLLECTION: Enhanced Grid
      */}
      <section id="products" className="py-24 md:py-32 bg-white relative">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 relative z-10">
            <div className="relative">
              <h2 className="font-display text-[15vw] md:text-[180px] leading-[0.8] font-black tracking-tighter text-[#f7f5f2] absolute -top-[0.8em] -left-[0.2em] -z-10 select-none">
                CURATED
              </h2>
              <span className="block text-[#c85a2d] font-bold tracking-[0.3em] uppercase text-xs mb-4 pl-1">
                Selected Works
              </span>
              <h2 className="font-display text-5xl md:text-6xl font-black text-[#2d241c]">
                Kurasi{" "}
                <span className="font-serif italic font-medium text-[#c85a2d]">
                  Terpilih
                </span>
              </h2>
            </div>

            <Link
              href="/products"
              className="group flex items-center gap-3 px-6 py-3 rounded-full border border-[#e8dcc8] hover:border-[#c85a2d] hover:bg-[#c85a2d] hover:text-white transition-all duration-300"
            >
              <span className="text-sm font-bold tracking-widest uppercase">
                Lihat Katalog
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block relative"
              >
                <div className="flex flex-col gap-6">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] border border-[#e8dcc8]/60 rounded-[40px] isolate">
                    {product.images[0] ? (
                      <Image
                        src={getImageUrl(product.images[0].url)}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#e8dcc8]">
                        <Sparkles className="w-10 h-10 opacity-30" />
                      </div>
                    )}

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-x-4 group-hover:translate-x-0">
                      <div className="w-14 h-14 rounded-full bg-[#2d241c] text-white flex items-center justify-center shadow-lift-md">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 px-2 items-center text-center">
                    <h3 className="font-display text-2xl font-black leading-tight text-[#2d241c] group-hover:text-[#c85a2d] transition-colors uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[#6b5b4b] font-bold font-sans uppercase tracking-[0.2em] text-[14px]">
                      {formatCurrency(Number(product.price))}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 
        NARRATIVE SECTION: "The Artisan Way"
        Reimagined as a seamless editorial continuation.
        Broken grid layout with overlapping elements and strong typographic hierarchy.
      */}
      <section
        id="story"
        className="py-32 md:py-48 bg-white relative overflow-hidden"
      >
        {/* Thread Line - Visual Connector from previous section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#e8dcc8] to-[#c85a2d] z-0"></div>

        <div className="px-6 md:px-12 max-w-[1700px] mx-auto relative z-10">
          {/* Section Header - Centered & Monumental */}
          <div className="text-center mb-24 md:mb-40 relative">
            <span className="inline-block py-2 px-6 rounded-full border border-[#2d241c] text-[#2d241c] text-xs font-bold uppercase tracking-[0.3em] bg-white relative z-10">
              Process & Soul
            </span>
            <h2 className="font-display text-[12vw] md:text-[140px] leading-[0.8] font-black text-[#2d241c] mt-8 tracking-tighter mix-blend-multiply relative z-10">
              THE{" "}
              <span
                className="text-transparent stroke-text"
                style={{ WebkitTextStroke: "1px #2d241c" }}
              >
                ARTISAN
              </span>{" "}
              WAY
            </h2>
            {/* Decorative circle behind title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[#f5f1ed] rounded-full blur-[80px] -z-0"></div>
          </div>

          {/* Staggered Editorial Layout */}
          <div className="space-y-32 md:space-y-0">
            {/* Block 01: Left Aligned */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative">
              <div className="w-full md:w-5/12 relative group">
                <div className="aspect-[4/5] relative rounded-[4rem] overflow-hidden bg-[#f3efe9] shadow-2xl border border-white/50">
                  {/* CSS Art: Yarn Softness */}
                  <div className="absolute inset-0">
                    {/* Abstract background blobs */}
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#7a9d7f]/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 -left-10 w-48 h-48 bg-[#c85a2d]/10 rounded-full blur-3xl animate-pulse delay-700"></div>

                    {/* SVG Illustration: Yarn Balls */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <svg
                        viewBox="0 0 200 240"
                        fill="none"
                        className="w-full h-full drop-shadow-xl"
                      >
                        {/* Yarn Ball 1 (Sage) */}
                        <circle
                          cx="60"
                          cy="80"
                          r="45"
                          fill="#7a9d7f"
                          className="opacity-90"
                        />
                        <path
                          d="M60 35c24.8 0 45 20.2 45 45s-20.2 45-45 45S15 104.8 15 80s20.2-45 45-45z"
                          stroke="#fff"
                          strokeWidth="0.5"
                          strokeOpacity="0.3"
                        />
                        <path
                          d="M40 50 Q 80 50, 80 110"
                          stroke="white"
                          strokeWidth="1"
                          strokeLinecap="round"
                          className="opacity-40"
                        />
                        <path
                          d="M30 70 Q 90 70, 70 100"
                          stroke="white"
                          strokeWidth="1"
                          strokeLinecap="round"
                          className="opacity-40"
                        />

                        {/* Yarn Ball 2 (Terracotta - Center overlap) */}
                        <circle
                          cx="130"
                          cy="110"
                          r="55"
                          fill="#c85a2d"
                          className="opacity-95"
                        />
                        <path
                          d="M130 55c30.4 0 55 24.6 55 55s-24.6 55-55 55-55-24.6-55-55 24.6-55 55-55z"
                          stroke="#fff"
                          strokeWidth="0.5"
                          strokeOpacity="0.3"
                        />
                        <path
                          d="M100 90 Q 160 80, 160 140"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className="opacity-40"
                        />
                        <path
                          d="M110 130 Q 150 100, 170 130"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className="opacity-40"
                        />

                        {/* Loose Thread Connection */}
                        <path
                          d="M130 165 C 130 200, 70 150, 70 200"
                          stroke="#c85a2d"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          className="drop-shadow-sm"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Foreground Glass Card */}
                  <div className="absolute bottom-8 right-8 bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg max-w-[180px] z-10 transition-transform duration-500 hover:-translate-y-2">
                    <div className="w-10 h-10 bg-[#7a9d7f]/20 rounded-full flex items-center justify-center mb-3 text-[#5a7d5f]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="font-display font-bold text-[#3f3328] text-sm leading-tight">
                      Premium Milk Cotton Blend
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#8b7b6b] mt-1">
                      Soft Touch
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-5/12 pt-12 md:pt-0">
                <span className="text-[#7a9d7f] font-mono text-xs uppercase tracking-widest mb-4 block">
                  01 — Material Source
                </span>
                <h3 className="font-display text-4xl md:text-6xl font-black mb-6 leading-[0.9]">
                  Natural & <br />
                  <span className="italic font-serif font-light">Ethical</span>
                </h3>
                <p className="text-lg text-[#6b5b4b] leading-relaxed max-w-md">
                  Kami hanya menggunakan benang katun susu (milk cotton) premium
                  yang lembut di kulit dan ramah lingkungan. Tanpa plastik
                  berlebih, kembali ke alam.
                </p>
              </div>
            </div>

            {/* Block 02: Right Aligned / Overlapping */}
            <div className="flex flex-col md:flex-row-reverse items-center justify-end gap-12 md:gap-24 relative md:-mt-20">
              <div className="w-full md:w-4/12 relative z-10 group">
                <div className="aspect-square relative rounded-full overflow-hidden bg-[#2d241c] border-8 border-white shadow-2xl flex items-center justify-center">
                  {/* SVG Art: The Loop / Hook */}
                  <div className="relative w-full h-full p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c85a2d]/20 to-transparent rounded-full animate-spin-slow opacity-50"></div>

                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full drop-shadow-2xl"
                    >
                      {/* Stylized Hook */}
                      <path
                        d="M70 20 L50 40 L30 20"
                        stroke="transparent"
                        fill="none"
                      />
                      <path
                        d="M60 10 C60 10, 65 5, 70 10 C 75 15, 70 20, 65 25 L 35 65 C 30 72, 25 80, 30 85 C 35 90, 45 90, 50 85"
                        stroke="#e8dcc8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        className="drop-shadow-lg"
                      />

                      {/* The Loop / Thread being pulled */}
                      <path
                        d="M40 55 C 20 50, 10 30, 30 20 C 50 10, 60 30, 50 45"
                        stroke="#c85a2d"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="5 3"
                        className="opacity-80"
                      />

                      {/* "Magic Ring" Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="white"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.1"
                      />
                    </svg>

                    {/* Number Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-display font-black text-white/10 text-[180px] leading-none select-none blur-[1px]">
                        02
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-5/12 text-right">
                <span className="text-[#c85a2d] font-mono text-xs uppercase tracking-widest mb-4 block">
                  02 — Craft Method
                </span>
                <h3 className="font-display text-4xl md:text-6xl font-black mb-6 leading-[0.9]">
                  Slow <br />
                  <span className="italic font-serif font-light">
                    Handcraft
                  </span>
                </h3>
                <p className="text-lg text-[#6b5b4b] leading-relaxed max-w-md ml-auto">
                  Tidak ada mesin. Hanya tangan-tangan terampil pengrajin lokal
                  yang mendedikasikan 8-12 jam untuk satu karakter.
                  Ketidaksempurnaan adalah tanda keaslian.
                </p>
              </div>
            </div>

            {/* Block 03: Centered Statement */}
            <div className="flex flex-col items-center text-center pt-24 md:pt-40 relative">
              <div className="h-24 w-px bg-[#2d241c] mb-12"></div>

              <div className="max-w-4xl relative">
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[200px] leading-none text-[#f5f1ed] -z-10 font-display font-black select-none">
                  03
                </span>
                <h3 className="font-display text-5xl md:text-8xl font-black mb-10 text-[#2d241c]">
                  Soulful Energy
                </h3>
                <p className="text-xl md:text-2xl text-[#6b5b4b] leading-relaxed font-medium">
                  &quot;Diciptakan dengan intensi positif. Setiap karakter
                  dirancang untuk membawa senyum dan ketenangan, menjadi{" "}
                  <span className="text-[#c85a2d] italic font-serif">
                    anchor visual
                  </span>{" "}
                  saat Anda kehilangan fokus.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
         FULL WIDTH IMAGE BREAK & PHILOSOPHY
         Replaces hard cut with organic shape transition.
      */}
      <section className="relative py-32 md:py-48 bg-[#2d241c] text-[#f5f1ed] overflow-hidden">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 flex flex-col items-start">
              <span className="inline-flex items-center gap-4 text-[#c85a2d] font-bold tracking-[0.2em] uppercase text-xs mb-8">
                <span className="w-8 h-px bg-[#c85a2d]"></span>
                Philosophy
              </span>

              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-10">
                &quot;Yoga bukan tentang menyentuh jari kaki, tapi apa yang Anda
                pelajari saat{" "}
                <span className="text-[#c85a2d] font-serif italic font-medium relative inline-block">
                  turun ke bawah
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-[#c85a2d]"
                    viewBox="0 0 200 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.00025 6.99997C25.7533 3.97825 80.8932 0.380722 198.001 2.00002"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .&quot;
              </h2>

              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full border border-[#f5f1ed]/20 flex items-center justify-center text-2xl font-serif italic text-[#c85a2d]">
                  Y
                </div>
                <div className="h-16 w-px bg-[#f5f1ed]/20"></div>
                <p className="flex-1 text-lg text-[#f5f1ed]/80 leading-relaxed max-w-sm">
                  Setiap karya kami adalah pengingat visual untuk tetap hadir di
                  sini, saat ini.
                </p>
              </div>
            </div>

            {/* Image Content - Organic Shape */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
              <div className="relative aspect-[3/4] w-full max-w-[500px]">
                {/* Decorative glow behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#c85a2d]/20 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative w-full h-full overflow-hidden rounded-t-[250px] rounded-b-[40px] border border-[#f5f1ed]/10 shadow-2xl isolate">
                  {/* Local Texture for Image Section */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none z-10"></div>

                  <Image
                    src="/images/knittedyoga.png"
                    alt="Yoga Philosophy"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-[2s] ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d241c]/60 to-transparent pointer-events-none"></div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#c85a2d] rounded-full flex items-center justify-center p-4 text-center">
                  <span className="font-display font-black text-sm uppercase leading-tight tracking-widest text-[#2d241c]">
                    Mindful
                    <br />
                    Living
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        PREMIUM FOOTER CTA 
        Enhanced with depth, textural narrative, and organic flow.
      */}
      <section className="py-40 md:py-64 bg-[#2d241c] text-white text-center px-6 relative overflow-hidden selection:bg-[#c85a2d] selection:text-white">
        <div className="relative z-30 max-w-6xl mx-auto flex flex-col items-center">
          {/* Top Label - Monospace Pattern */}
          <div className="flex flex-col items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="text-[#c85a2d] font-mono text-[10px] uppercase tracking-[0.5em] font-bold">
              Final Chapter • Begin Your Journey
            </span>
            <div className="w-8 h-px bg-[#c85a2d]/40"></div>
          </div>

          <h2 className="relative font-display text-[14vw] md:text-[160px] lg:text-[200px] font-black leading-[0.75] tracking-tight mb-16 text-white drop-shadow-2xl">
            <span className="block opacity-90">TEMUKAN</span>

            <div className="relative my-6 md:my-4 flex items-center justify-center">
              {/* Underline Decoration */}
              <svg
                className="absolute -bottom-2 w-full max-w-[400px] h-4 text-[#c85a2d] opacity-60"
                viewBox="0 0 200 9"
                fill="none"
              >
                <path
                  d="M2 7C30 4 80 1 198 2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[#c85a2d] font-serif italic font-light tracking-tight text-[0.45em] md:text-[0.4em] relative z-10 block animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                Teman Sejati
              </span>
            </div>

            <span
              className="block text-transparent stroke-text"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}
            >
              BARU
            </span>

            {/* Floating Decorative Icon */}
            <div className="absolute -top-12 -right-12 md:-right-24 hidden md:block animate-bounce-slow">
              <Sparkles className="w-12 h-12 text-[#c85a2d]/40" />
            </div>
          </h2>

          <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl mb-20 leading-relaxed text-balance">
            Setiap karakter memiliki cerita. Pilih teman yang beresonansi dengan
            perjalanan Anda hari ini.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 w-full justify-center px-4">
            <Link
              href="/products"
              className="group relative h-20 md:h-24 px-12 md:px-20 rounded-[40px] bg-[#c85a2d] text-white font-black text-xl hover:bg-white hover:text-[#2d241c] transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(200,90,45,0.5)] hover:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)] flex items-center gap-6 uppercase tracking-[0.2em] overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700 ease-in-out"></div>
              <span className="relative z-10 group-hover:scale-110 transition-transform">
                Eksplorasi Sekarang
              </span>
              <div className="relative z-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#2d241c] group-hover:border-[#2d241c] transition-colors">
                <MoveRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </div>
            </Link>

            <div className="flex flex-col items-center sm:items-start gap-2">
              <Link
                href="/track-order"
                className="group inline-flex items-center gap-3 text-white/50 hover:text-white font-bold uppercase tracking-[0.2em] text-sm transition-all py-2"
              >
                <span>Lacak Pesanan</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#c85a2d] scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
          </div>

          {/* Bottom Footnote - Editorial Detail */}
          <div className="mt-32 pt-12 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Artisanal Crochet • Established 2026
            </span>
            <div className="flex gap-8">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                Limited Batches
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                Handmade Only
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
