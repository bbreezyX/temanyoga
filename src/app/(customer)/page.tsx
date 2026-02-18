import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Sparkles, ArrowRight, ArrowUpRight, MoveRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";

const SITE_URL = "https://ditemaniyoga.com";

export const metadata: Metadata = {
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
        HERO SECTION: Editorial & Open
        No cards. Text interacting with negative space.
      */}
      <section className="relative min-h-[100dvh] md:min-h-[90vh] flex flex-col pt-2 md:pt-14 pb-12 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center flex-1">
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-center z-10">
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-[#c85a2d]"></span>
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#c85a2d]">
                Handmade in Indonesia • Est. 2026
              </span>
            </div>

            <h1 className="font-display text-[16vw] sm:text-[14vw] lg:text-[11vw] xl:text-[180px] leading-[0.8] font-black tracking-[-0.05em] text-[#2d241c]">
              MODERN
              <br />
              <span className="ml-[0.1em] md:ml-[0.5em] lg:ml-[1em] text-[#c85a2d] italic serif font-medium block -mt-2 md:-mt-6 lg:-mt-10 relative z-20">
                Amigurumi
              </span>
            </h1>

            <p className="mt-8 md:mt-12 text-[17px] md:text-[22px] font-medium text-[#6b5b4b] max-w-xl leading-relaxed border-l-2 border-[#c85a2d] pl-6 md:pl-8">
              Lebih dari sekadar boneka rajut. Sebuah simbol kehadiran,
              ketenangan, dan teman setia dalam setiap perjalanan yoga Anda.
              Dibuat dengan hati, untuk jiwa.
            </p>

            <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <Link
                href="/products"
                className="group flex items-center gap-5 text-lg md:text-xl font-black uppercase tracking-widest border-b-2 border-[#c85a2d] pb-2 hover:text-[#c85a2d] transition-all"
              >
                Eksplorasi Kurasi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
              </Link>
              <Link
                href="#story"
                className="group flex items-center gap-5 text-lg font-bold text-[#6b5b4b] uppercase tracking-widest hover:text-[#2d241c] transition-colors"
              >
                Cerita Kami
              </Link>
            </div>
          </div>

          <div className="hidden md:flex lg:col-span-5 relative md:h-[50vh] lg:h-[80vh] w-full items-center justify-center mb-4 lg:mb-0">
            <div className="relative w-full h-full">
              <div className="absolute top-[5%] md:top-[10%] right-0 w-full md:w-[90%] h-[95%] md:h-[80%] overflow-hidden rounded-[32px] md:rounded-[80px]">
                <Image
                  src="/images/crochet.png"
                  alt="Yoga Companion"
                  fill
                  priority
                  className="object-cover object-center hover:scale-105 transition-transform duration-[2s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Decorative floating elements */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-24 h-24 md:w-40 md:h-40 bg-[#c85a2d] rounded-full mix-blend-multiply blur-2xl md:blur-3xl opacity-20 pointer-events-none"></div>

              <div className="absolute top-[10%] left-0 md:bottom-[10%] md:left-[-10%] md:top-auto bg-white/80 backdrop-blur-md p-4 md:p-6 max-w-[140px] md:max-w-[200px] rounded-2xl shadow-sm md:shadow-none border border-white/50 md:border-none">
                <p className="font-display text-2xl md:text-4xl font-black mb-1">
                  100%
                </p>
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#6b5b4b]">
                  Cotton Milk Premium
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        MARQUEE SEPARATOR 
      */}
      <div className="w-full bg-[#3f3328] text-[#f5f1ed] py-4 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee-ltr flex items-center gap-16 min-w-full font-display font-bold text-lg uppercase tracking-widest opacity-80">
          {Array(16)
            .fill("Mindfulness • Handmade • Serenity • Connection •")
            .map((text, i) => (
              <span key={i}>{text}</span>
            ))}
        </div>
      </div>

      {/* 
        FEATURED COLLECTION: Clean Grid, No Cards
      */}
      <section id="products" className="py-24 md:py-32 bg-white">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <h2 className="font-display text-[12vw] md:text-[80px] leading-[0.9] font-black tracking-tighter text-[#e8dcc8] select-none absolute -translate-y-1/2 pointer-events-none z-0">
                COLLECTION
              </h2>
              <h2 className="relative z-10 font-display text-4xl md:text-5xl font-bold text-[#3f3328] ml-2 mt-4 md:mt-0">
                Kurasi{" "}
                <span className="text-[#c85a2d] italic serif">Terpilih</span>
              </h2>
            </div>

            <Link
              href="/products"
              className="relative z-10 flex items-center gap-2 font-bold uppercase tracking-widest text-xs hover:text-[#c85a2d] transition-colors group border-b border-transparent hover:border-[#c85a2d] pb-0.5"
            >
              Lihat Semua Katalog{" "}
              <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
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
        NARRATIVE SECTION: "The Journey"
        Alternating text and imagery. Big typography.
      */}
      <section
        id="story"
        className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <h2 className="font-display text-5xl md:text-7xl font-black leading-[0.95] mb-8">
              The
              <br />
              Artisan
              <br />
              <span className="text-[#7a9d7f] italic serif">Way</span>
            </h2>
            <p className="text-lg text-[#6b5b4b] leading-relaxed mb-8">
              Setiap simpul adalah nafas. Setiap boneka adalah doa. Proses kami
              adalah meditasi yang menghasilkan teman setia untuk perjalanan
              yoga Anda.
            </p>
            <div className="w-16 h-1 bg-[#2d241c]"></div>
          </div>

          <div className="lg:col-span-8 space-y-32">
            {[
              {
                title: "Natural & Ethical",
                subtitle: "01 / Material",
                desc: "Kami hanya menggunakan benang katun susu (milk cotton) premium yang lembut di kulit dan ramah lingkungan. Tanpa plastik berlebih, kembali ke alam.",
              },
              {
                title: "Slow Craft",
                subtitle: "02 / Process",
                desc: "Tidak ada mesin. Hanya tangan-tangan terampil pengrajin lokal yang mendedikasikan 8-12 jam untuk satu karakter. Ketidaksempurnaan kecil adalah tanda keaslian.",
              },
              {
                title: "Soulful Energy",
                subtitle: "03 / Spirit",
                desc: "Diciptakan dengan intensi positif. Setiap karakter dirancang untuk membawa senyum dan ketenangan, menjadi anchor (jangkar) visual saat Anda kehilangan fokus.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-8 md:gap-16 border-t border-[#e8dcc8] pt-8 group hover:border-[#c85a2d] transition-colors duration-500"
              >
                <span className="font-mono text-sm uppercase tracking-widest text-[#9ca3af] group-hover:text-[#c85a2d] transition-colors w-32 shrink-0">
                  {item.subtitle}
                </span>
                <div>
                  <h3 className="font-display text-4xl md:text-5xl font-black mb-6 group-hover:translate-x-2 transition-transform duration-500">
                    {item.title}
                  </h3>
                  <p className="text-xl text-[#6b5b4b] max-w-lg leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
         FULL WIDTH IMAGE BREAK
      */}
      <section className="py-24 md:py-32 bg-[#2d241c] text-[#f5f1ed] overflow-hidden">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Text Content */}
            <div className="relative z-10 order-2 lg:order-1">
              <span className="inline-block text-[#c85a2d] font-bold tracking-[0.2em] uppercase text-sm mb-6 border-l-2 border-[#c85a2d] pl-4">
                Philosophy
              </span>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8">
                &quot;Yoga bukan tentang menyentuh jari kaki, tapi apa yang Anda
                pelajari saat{" "}
                <span className="text-[#c85a2d] italic serif font-medium">
                  turun ke bawah
                </span>
                .&quot;
              </h2>
              <div className="w-24 h-1.5 bg-[#c85a2d] rounded-full"></div>
            </div>

            {/* Image Content - Contained */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative aspect-square md:aspect-[4/3] lg:aspect-[3/4] w-full max-w-lg overflow-hidden rounded-[32px] md:rounded-[48px] bg-[#3f3328] rotate-2 hover:rotate-0 transition-transform duration-700 ease-in-out ring-1 ring-white/10">
                <Image
                  src="/images/knittedyoga.png"
                  alt="Yoga Philosophy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        PREMIUM FOOTER CTA 
      */}
      <section className="py-32 bg-[#2d241c] text-white text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-[#c85a2d]/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-16 h-px bg-[#c85a2d] mb-12" />
          <h2 className="font-display text-5xl md:text-8xl font-black mb-12 leading-[0.9] tracking-tighter">
            TEMUKAN{" "}
            <span className="text-[#c85a2d] italic serif font-medium">
              Teman
            </span>
            <br />
            HIDUP BARU
          </h2>
          <Link
            href="/products"
            className="h-20 px-16 rounded-full bg-[#c85a2d] text-white font-black text-lg hover:bg-white hover:text-[#2d241c] transition-all shadow-lift-md flex items-center gap-4 uppercase tracking-[0.2em]"
          >
            Mulai Belanja
            <MoveRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
