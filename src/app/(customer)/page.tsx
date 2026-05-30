import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { StorageImage } from "@/components/storage-image";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Hand,
  Heart,
  Gem,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getFeaturedProducts } from "@/lib/product-queries";
import { SITE_URL } from "@/lib/site-url";
import { HashScroll } from "@/components/layout/hash-scroll";
import { HeroAnimation } from "@/components/layout/hero-animation";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Boneka Rajut Yoga Premium",
  description:
    "Lebih dari sekadar boneka rajut. Sebuah simbol kehadiran, ketenangan, dan teman setia dalam setiap perjalanan yoga Anda.",
  alternates: {
    canonical: SITE_URL,
  },
};

const HERO_IMAGE_SRC = "/images/knittedyoga-cutout.png";
const HERO_IMAGE_ALT =
  "Boneka rajut yoga D'TEMAN YOGA — ilustrasi cutout karakter meditasi";

const TRUST_VALUES = [
  { Icon: Leaf, label: "100% Katun Susu" },
  { Icon: Hand, label: "Dirajut Tangan" },
  { Icon: Gem, label: "Edisi Terbatas" },
];

const STORY_STEPS = [
  {
    no: "01",
    eyebrow: "Material Source",
    title: "Natural & Ethical",
    body: "Kami hanya menggunakan benang katun susu (milk cotton) premium yang lembut di kulit dan ramah lingkungan. Tanpa plastik berlebih, kembali ke alam.",
    Icon: Leaf,
  },
  {
    no: "02",
    eyebrow: "Craft Method",
    title: "Slow Handcraft",
    body: "Tidak ada mesin. Hanya tangan-tangan terampil pengrajin lokal yang mendedikasikan 8–12 jam untuk satu karakter. Ketidaksempurnaan adalah tanda keaslian.",
    Icon: Hand,
  },
  {
    no: "03",
    eyebrow: "The Soul",
    title: "Soulful Energy",
    body: "Diciptakan dengan intensi positif. Setiap karakter dirancang untuk membawa senyum dan ketenangan — anchor visual saat Anda kehilangan fokus.",
    Icon: Heart,
  },
];

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
          url: `${SITE_URL}/icon-512x512.png`,
          width: 512,
          height: 512,
        },
        description:
          "Boneka rajut yoga premium handmade oleh pengrajin lokal Indonesia. Simbol kedamaian dan teman setia dalam setiap asana.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "D`TEMAN YOGA",
        inLanguage: "id-ID",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-ink selection:bg-action selection:text-white overflow-x-hidden md:-mt-24 md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HashScroll />

      {/* ─────────────────────────  HERO  ───────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center px-5 pt-8 pb-20 sm:px-8 sm:pt-12 md:min-h-[calc(100svh-6rem)] md:pb-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 lg:gap-16">
          {/* Text column */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            {/* Eyebrow pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-paper px-5 py-2 text-xs font-semibold tracking-wide text-ink-soft shadow-sm sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <Sparkles className="h-4 w-4 text-action" />
              Handmade in Indonesia · Est. 2026
            </span>

            {/* Headline */}
            <h1 className="sr-only">
              Boneka Rajut Yoga Premium — Modern Amigurumi
            </h1>
            <p
              aria-hidden="true"
              className="mt-8 font-bungee text-[clamp(2.75rem,9vw,5.25rem)] leading-[0.95] text-ink animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both"
            >
              MODERN
              <span className="mt-1 block text-action">AMIGURUMI</span>
            </p>

            {/* Subhead */}
            <p className="mt-7 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
              Lebih dari sekadar boneka rajut — simbol kehadiran, ketenangan,
              dan teman setia dalam setiap perjalanan yoga Anda.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-action px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/50 sm:text-base"
              >
                Eksplorasi Kurasi
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-canvas-oat px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:text-base"
              >
                Cerita Kami
              </Link>
            </div>
          </div>

          {/* Animated yoga character — Lottie when available, photo-card fallback */}
          <HeroAnimation
            fallback={
              <div className="relative mx-auto aspect-square w-full max-w-md md:max-w-none">
                <Image
                  src={HERO_IMAGE_SRC}
                  alt={HERO_IMAGE_ALT}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="animate-hero-float object-contain drop-shadow-[0_24px_34px_rgba(63,51,40,0.18)]"
                />
              </div>
            }
          />
        </div>
      </section>

      {/* ───────────────────────  TRUST VALUES  ──────────────────── */}
      <section className="px-5 py-8 sm:px-8">
        <ul className="mx-auto flex w-full max-w-3xl flex-col divide-y divide-black/5 overflow-hidden rounded-3xl border border-black/5 bg-paper shadow-sm sm:flex-row sm:divide-x sm:divide-y-0 sm:rounded-full">
          {TRUST_VALUES.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex flex-1 items-center justify-center gap-3 px-6 py-4 text-sm font-semibold text-ink sm:text-base"
            >
              <Icon className="h-5 w-5 shrink-0 text-action" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* ────────────────────  FEATURED COLLECTION  ──────────────── */}
      <section id="products" className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-action">
                Selected Works
              </span>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,5.5vw,3.75rem)] font-black leading-[1.02] tracking-[-0.02em] text-ink">
                Kurasi Terpilih
              </h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-paper px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:border-action hover:bg-action hover:text-white"
            >
              Lihat Katalog
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block rounded-[32px] border border-black/5 bg-paper p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(32,32,32,0.3)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-canvas-oat">
                    {product.images[0] ? (
                      <StorageImage
                        storageUrl={product.images[0].url}
                        alt={product.name}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink/20">
                        <Sparkles className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 pt-4 pb-1">
                    <h3 className="line-clamp-1 text-base font-semibold text-ink transition-colors group-hover:text-action">
                      {product.name}
                    </h3>
                    <span className="mt-2 inline-block rounded-full bg-canvas-oat px-3 py-1 text-sm font-semibold text-ink">
                      {formatCurrency(Number(product.price))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-black/5 bg-paper px-8 py-16 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-action/40" />
              <p className="mt-4 text-base font-medium text-ink-soft">
                Koleksi baru sedang dirajut. Segera hadir.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────  THE ARTISAN WAY  ─────────────────── */}
      <section
        id="story"
        className="scroll-mt-24 px-5 py-20 sm:px-8 md:scroll-mt-28 md:py-28"
      >
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-paper px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
            Process & Soul
          </span>
          <h2 className="mt-5 font-serif text-[clamp(2.25rem,6vw,4rem)] font-black leading-[1.02] tracking-[-0.02em] text-ink">
            The Artisan Way
          </h2>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:gap-8">
          {STORY_STEPS.map((step, i) => {
            const { Icon } = step;
            const imageFirst = i % 2 === 0;
            return (
              <div
                key={step.no}
                className="grid items-center gap-6 rounded-[40px] border border-black/5 bg-paper p-6 md:grid-cols-2 md:gap-10 md:p-10"
              >
                {/* Illustration panel */}
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[28px] border border-ink/10 bg-canvas-oat ${
                    imageFirst ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <span className="font-serif text-[clamp(4rem,14vw,9rem)] font-black leading-none text-ink/10 select-none">
                    {step.no}
                  </span>
                  <span className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-paper text-action shadow-md">
                    <Icon className="h-7 w-7" />
                  </span>
                </div>

                {/* Text */}
                <div className={imageFirst ? "md:order-2" : "md:order-1"}>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-action">
                    {step.no} — {step.eyebrow}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-ink md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────  PHILOSOPHY  ──────────────────── */}
      <section className="px-5 py-10 sm:px-8 md:py-14">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-action px-8 py-16 text-center text-white md:px-16 md:py-24">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              Filosofi Kami
            </span>
            <p className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.01em]">
              Yoga bukan tentang menyentuh jari kaki.
            </p>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Tapi tentang apa yang Anda pelajari saat turun ke bawah. Setiap
              karya dibuat sebagai pengingat untuk kembali hadir.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────  CLOSING CTA  ──────────────────── */}
      <section className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-4xl rounded-[40px] border-2 border-ink bg-paper px-8 py-16 text-center shadow-[0_30px_80px_-40px_rgba(32,32,32,0.4)] md:px-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-action">
            Temukan Teman Baru
          </span>
          <h2 className="mt-4 font-serif text-[clamp(2.25rem,6vw,4rem)] font-black leading-[1.02] tracking-[-0.02em] text-ink">
            Pilih Karaktermu
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Setiap karya dibuat untuk menemani ritual yang tenang, personal, dan
            penuh kehadiran. Temukan yang paling beresonansi hari ini.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-action px-8 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/50 md:text-base"
            >
              Lihat koleksi
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center rounded-full border border-ink/15 px-7 py-4 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 md:text-base"
            >
              Lacak pesanan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
