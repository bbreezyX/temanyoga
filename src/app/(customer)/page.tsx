import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Lock,
  Hand,
  Truck,
  Scissors,
  Palette,
  Star,
  Quote,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";


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

async function getLatestReviews() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      where: { rating: { gte: 4 } },
    });
    return reviews;
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const reviews = await getLatestReviews();

  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans selection:bg-[#c85a2d] selection:text-white">
      {/* 
        HERO SECTION - IMMERSIVE & EXPRESSIVE 
      */}
      <section className="relative pt-6 pb-6 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="relative min-h-[70svh] md:min-h-[75svh] lg:min-h-[80svh] flex flex-col items-start justify-center py-12 md:py-20 px-6 md:px-16 rounded-[40px] md:rounded-[64px] bg-white overflow-hidden shadow-soft ring-1 ring-[#e8dcc8]/50 animate-floatIn">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#c85a2d]/15 to-[#7a9d7f]/8 blur-[80px] opacity-70 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-[#7a9d7f]/15 to-[#c85a2d]/8 blur-[80px] opacity-70 pointer-events-none"></div>

          <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 mb-8 transform -rotate-1 md:rotate-0">
              <span className="flex h-2 w-2 rounded-full bg-[#c85a2d]"></span>
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                Koleksi Terbaru • 2026
              </span>
            </div>

            <h1 className="font-display text-[48px] md:text-[84px] lg:text-[100px] leading-[0.95] tracking-[-0.04em] font-black text-slate-900 max-w-[12ch]">
              Ditemani{" "}
              <span className="text-[#c85a2d] italic font-medium serif uppercase">
                Yoga
              </span>{" "}
              Hingga{" "}
              <span className="relative inline-block">
                Sempurna
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#7a9d7f]/40 -z-10"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-[16px] md:text-[20px] leading-relaxed text-slate-600 max-w-[40ch] font-medium">
              Perjalanan yoga lebih bermakna bersama dTeman. Koleksi boneka
              rajut eksklusif yang membawa energi positif di setiap asana Anda.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                href="#products"
                className="group relative inline-flex items-center justify-center gap-3 min-h-[64px] px-10 rounded-full bg-[#c85a2d] text-white font-black overflow-hidden shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">Pilih dTemanmu</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>

              <Link
                href="#how"
                className="inline-flex items-center justify-center gap-3 min-h-[64px] px-10 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all"
              >
                <span>Kenali Proses</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block absolute right-16 bottom-24 w-64 h-80 rounded-[48px] bg-slate-100 ring-1 ring-white/50 shadow-2xl overflow-hidden rotate-6 hover:rotate-0 transition-transform duration-500 transform-gpu text-slate-100/5">
            <div className="absolute inset-0 bg-[#c85a2d]/5 mix-blend-multiply"></div>
            <Image
              src="/images/crochet.png"
              alt="Yoga Preview"
              fill
              quality={95}
              priority
              className="object-cover"
              sizes="512px"
            />
          </div>

        </div>
      </section>

      {/* 
        THE ARTISAN JOURNEY - BENTO STYLE 
      */}
      <section
        id="how"
        className="pt-20 md:pt-48 pb-12 md:pb-32 px-6 md:px-8 max-w-7xl mx-auto relative z-10"
      >
        <div className="absolute top-0 right-[20%] w-32 h-32 bg-[#7a9d7f]/8 rounded-full blur-2xl -translate-y-1/2 pointer-events-none"></div>

        <div className="relative mb-20 px-2 lg:px-0">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-slate-200/50 text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  The Journey
                </span>
                <div className="w-8 h-px bg-slate-400"></div>
              </div>
              <h2 className="font-display text-[40px] md:text-[64px] font-black leading-[0.9] tracking-tighter">
                Dibuat dengan <br />
                <span className="text-[#c85a2d] italic serif font-medium">
                  Teliti
                </span>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-slate-500 font-medium leading-relaxed border-l-2 border-[#7a9d7f] pl-6 py-2">
                Setiap produk dTeman adalah perwujudan dari ketelitian, waktu, 
                dan energi positif yang kami tuangkan dalam setiap simpul.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[240px]">
          <div className="md:col-span-12 lg:col-span-5 rounded-[48px] bg-[#fdf8f6] p-10 ring-1 ring-[#c85a2d]/10 flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-[var(--rounded-organic-1)] bg-[#c85a2d] text-white grid place-items-center shadow-lg group-hover:rotate-12 transition-transform">
              <Palette className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">
                Material Terpilih
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Kami mengurasi benang katun susu (milk cotton) premium yang 
                lembut, ramah lingkungan, dan tahan lama untuk kenyamanan Anda.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-7 rounded-[48px] bg-[#7a9d7f]/5 p-10 ring-1 ring-[#7a9d7f]/20 flex flex-col justify-between group hover:bg-[#7a9d7f]/10 transition-colors">
            <div className="w-16 h-16 rounded-[var(--rounded-organic-2)] bg-[#7a9d7f] text-white grid place-items-center shadow-lg group-hover:-rotate-12 transition-transform">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">
                Simpul Dedikasi
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium font-display">
                Tanpa mesin. Setiap dTeman menghabiskan 8-12 jam pengerjaan manual 
                oleh pengrajin lokal berbakat kami dengan standar detail tinggi.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-12 rounded-[48px] bg-slate-900 p-10 md:p-12 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32"></div>
            <div className="flex-1 z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 grid place-items-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight">
                Asana Charm
              </h3>
              <p className="text-slate-400 leading-relaxed max-w-md font-medium">
                Lebih dari sekadar aksesori—ini adalah pendamping yang menciptakan 
                koneksi emosional di setiap latihan, membantu Anda tetap hadir 
                dan tenang di setiap asana.
              </p>
            </div>
            <div className="flex-1 w-full z-10">
              <div className="bg-white/10 rounded-[32px] p-8 ring-1 ring-white/20">
                <blockquote className="italic text-slate-300 font-medium">
                  &quot;Simpul yang dibuat dengan cinta akan membawa ketenangan bagi yang membawanya.&quot;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FEATURED PRODUCTS 
      */}
      <section id="products" className="mb-20 md:mb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="py-16 md:py-24 bg-white rounded-[40px] md:rounded-[64px] shadow-soft relative z-20 overflow-hidden ring-1 ring-[#e8dcc8]/50">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-[#7a9d7f]/5 blur-[60px] pointer-events-none"></div>
          <div className="relative z-10 px-6 md:px-16 max-w-7xl mx-auto mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <h2 className="font-display text-[32px] md:text-[56px] font-black leading-[1.1] tracking-tight">
                Kurasi <span className="text-[#c85a2d]">Terbaru</span>
              </h2>
              <Link
                href="/products"
                className="flex items-center gap-3 text-[14px] font-black uppercase tracking-widest text-[#c85a2d] hover:gap-5 transition-all"
              >
                Lihat Semua <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="flex overflow-x-auto pb-12 px-6 md:px-8 gap-6 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible relative z-10">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex-shrink-0 w-[300px] md:w-full relative bg-white rounded-[48px] overflow-hidden ring-1 ring-slate-100/80 hover:ring-[#c85a2d]/20 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full transform-gpu"
              >
                <div className="aspect-[4/5] overflow-hidden relative isolate">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  
                  {/* Floating Badges Container */}
                  <div className="absolute top-4 inset-x-4 flex justify-between items-start z-20 pointer-events-none">
                    
                    <div className="px-2.5 py-1 rounded-full bg-[#7a9d7f]/90 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5">
                      <div className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-white">
                        Tersedia
                      </span>
                    </div>
                  </div>

                  {product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0].url)}
                      alt={product.name}
                      fill
                      quality={90}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 transform-gpu"
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 25vw, 400px"
                      priority={index < 2}
                      loading={index < 2 ? undefined : "lazy"}
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-50 grid place-items-center">
                      <Sparkles className="w-10 h-10 text-slate-200" />
                    </div>
                  )}
                  
                  {/* Floating Action Hint */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/90 backdrop-blur-sm text-[#c85a2d] px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Detail Produk <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/30">
                  <h3 className="font-display font-black text-2xl text-slate-900 mb-4 leading-tight line-clamp-2 min-h-[2.4em] group-hover:text-[#c85a2d] transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex-1"></div>
                  
                  <div className="space-y-6">
                    <div className="h-px w-full bg-slate-100"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Harga</span>
                        <span className="text-2xl font-display font-black text-[#c85a2d] tracking-tight">
                          {formatCurrency(Number(product.price))}
                        </span>
                      </div>
                      
                      <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-[#c85a2d] group-hover:text-white transition-all duration-500 shadow-sm">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Artistic Divider Section */}
          <div className="relative mt-12 mb-8 px-6 md:px-16 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8dcc8] to-[#e8dcc8]/20"></div>
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-[#c85a2d]' : 'bg-[#e8dcc8]'}`}></div>
                ))}
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8dcc8] to-[#e8dcc8]/20"></div>
            </div>
            
            {/* Soft background text behind the divider for extra texture */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 text-[60px] md:text-[80px] font-black text-slate-50/50 uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none select-none italic font-display">
              HANDMADE QUALITY
            </div>
          </div>

          <div className="pb-24 px-6 md:px-8 relative z-10">
            <div className="max-w-7xl mx-auto pt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

              {[
                {
                  icon: Lock,
                  title: "Aman & Nyaman",
                  desc: "Transaksi terenkripsi standar industri untuk ketenangan pikiran Anda saat berbelanja.",
                },
                {
                  icon: Sparkles,
                  title: "Energi Positif",
                  desc: "Setiap boneka rajut dibuat dengan energi unik untuk meningkatkan kesadaran Anda.",
                },
                {
                  icon: Hand,
                  title: "Desain Inklusif",
                  desc: "Kami mengajak semua orang dari berbagai latar belakang untuk bergabung di komunitas yoga kami.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 rounded-[32px] bg-[#f5f1ed]/50 ring-1 ring-slate-100 flex items-center justify-center mb-8 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                    <item.icon
                      className={`w-8 h-8 ${i === 1 ? "text-[#c85a2d]" : i === 2 ? "text-[#7a9d7f]" : "text-slate-900"}`}
                    />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-[28ch]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 
        COMMUNITY & REVIEWS 
      */}
      <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="relative mb-20 text-center">
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white ring-1 ring-slate-200 text-slate-500 mb-6">
            <Star className="w-3 h-3 text-[#c85a2d] fill-[#c85a2d]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sahabat dTeman</span>
          </div>
          <h2 className="font-display text-[40px] md:text-[64px] font-black leading-[0.9] tracking-tighter">
            Cerita dari <br />
            <span className="text-[#7a9d7f] italic serif font-medium">Komunitas</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {(reviews.length > 0 ? reviews : [
            { id: "f1", customerName: "Dita Kusuma", rating: 5, comment: "Bonekanya sangat detail dan benangnya lembut sekali. Jadi penyemangat di tas yoga saya!" },
            { id: "f2", customerName: "Budi Oetomo", rating: 5, comment: "Pengiriman cepat dan packingnya sangat aman. Sangat mereferensikan untuk dijadikan kado." },
            { id: "f3", customerName: "Sari Wandini", rating: 5, comment: "Suka banget sama filosofinya. Tiap lihat boneka ini jadi inget buat napas panjang dan tenang." }
          ]).map((review) => (
            <div key={review.id} className="bg-white p-10 rounded-[48px] shadow-soft ring-1 ring-slate-100 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500">
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#c85a2d] fill-[#c85a2d]" />
                  ))}
                </div>
                <div className="relative">
                  <Quote className="absolute -top-4 -left-6 w-12 h-12 text-slate-100 -z-10 group-hover:text-[#c85a2d]/10 transition-colors" />
                  <p className="text-slate-600 font-medium leading-relaxed italic relative z-10">
                    &quot;{review.comment}&quot;
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                  {review.customerName[0]}
                </div>
                <span className="font-bold text-slate-900">{review.customerName}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        BRAND PHILOSOPHY - IMMERSIVE STORYTELLING
      */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900 text-white rounded-[40px] md:rounded-[64px] py-24 md:py-32 overflow-hidden relative shadow-2xl ring-1 ring-white/10">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#c85a2d]/10 skew-x-12 translate-x-1/2"></div>
          <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-[#c85a2d] font-black uppercase tracking-[0.3em] text-sm">
                    Filosofi dTeman
                  </h3>
                  <h2 className="font-display text-[48px] md:text-[72px] font-black leading-[1.05] tracking-tighter">
                    Yoga Adalah <br />
                    <span className="italic serif font-medium text-[#7a9d7f]">
                      Perjalanan Bersama
                    </span>
                  </h2>
                </div>
                <div className="space-y-8 text-slate-300 text-lg leading-relaxed font-medium max-w-xl">
                  <p>
                    Nama merek{" "}
                    <span className="text-white font-bold">
                      &quot;D`TEMAN YOGA&quot;
                    </span>{" "}
                    berasal dari kata{" "}
                    <span className="italic">&quot;ditemani yoga&quot;</span>
                    —sebuah konsep bahwa yoga adalah sebuah perjalanan yang
                    lebih bermakna ketika dijalani bersama teman.
                  </p>
                  <p>
                    Kami terinspirasi oleh para praktisi yoga dari berbagai
                    latar belakang, yang menunjukkan bahwa yoga dapat menyatukan
                    orang-orang tanpa memandang usia, jenis kelamin, maupun
                    budaya.
                  </p>
                  <p>
                    Setiap individu memiliki energi unik, dan kami percaya
                    boneka rajut yoga kami dapat menjadi{" "}
                    <span className="text-[#c85a2d] font-bold">
                      teman setia
                    </span>{" "}
                    yang membantu meningkatkan energi positif dan kesadaran
                    Anda.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="relative aspect-square rounded-[64px] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl transform-gpu">
                  <Image
                    src="/images/knittedyoga.png"
                    alt="Yoga Community"
                    fill
                    quality={95}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 50vw, 800px"
                  />
                </div>
              </div>

            </div>
            <div className="mt-32 text-center max-w-4xl mx-auto">
              <p className="font-display text-2xl md:text-3xl font-medium leading-relaxed italic text-slate-100/90">
                &quot;Mari kita berlatih yoga bersama, dan temukan kedamaian
                serta kebahagiaan dalam setiap asana.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
