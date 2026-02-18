"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "@/components/review/product-reviews";
import type {
  ProductDetail as ProductDetailType,
  CartAccessory,
} from "@/types/api";

const AccessoriesSelector = dynamic(
  () => import("./accessories-selector").then((mod) => mod.AccessoriesSelector),
  {
    loading: () => (
      <div className="flex items-center gap-3 py-4">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-[#f9f9f9] rounded" />
      </div>
    ),
    ssr: false,
  },
);

function AccessoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-[#f9f9f9] rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse bg-[#f9f9f9] rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 rounded-2xl animate-pulse bg-[#f9f9f9]" />
          <div className="h-16 rounded-2xl animate-pulse bg-[#f9f9f9]" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAccessories, setSelectedAccessories] = useState<
    CartAccessory[]
  >([]);
  const [accessoriesTotal, setAccessoriesTotal] = useState(0);

  const handleAccessoriesChange = useCallback(
    (accessories: CartAccessory[], total: number) => {
      setSelectedAccessories(accessories);
      setAccessoriesTotal(total);
    },
    [],
  );

  const images =
    product.images.length > 0 ? product.images : [{ url: "", id: "fallback" }];
  const activeImage = images[activeImageIndex];
  const displayPrice = Number(product.price) + accessoriesTotal;

  const handleAddToCart = () => {
    // Defer cart update to next frame to ensure toast appears instantly
    requestAnimationFrame(() => {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.images[0]?.url ?? null,
        quantity,
        stock: product.stock,
        accessories: selectedAccessories,
      });
    });
  };

  return (
    <div
      className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pb-24"
      id="top"
    >
      <section className="pt-8 md:pt-12">
        <nav className="flex items-center gap-3 text-[13px] md:text-[14px] font-medium text-[#6b5b4b]">
          <Link
            href="/"
            className="hover:text-[#c85a2d] transition-all hover:translate-x-0.5"
          >
            Beranda
          </Link>
          <span className="w-1 h-1 rounded-full bg-[#e8dcc8]" />
          <Link
            href="/products"
            className="hover:text-[#c85a2d] transition-all hover:translate-x-0.5"
          >
            Produk
          </Link>
          <span className="w-1 h-1 rounded-full bg-[#e8dcc8]" />
          <span className="font-bold text-[#3f3328] truncate">
            {product.name}
          </span>
        </nav>
      </section>

      <section className="pt-10 md:pt-16 grid gap-12 lg:grid-cols-12 lg:gap-20 animate-floatIn">
        {/* Left: Images */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 lg:sticky lg:top-32 self-start">
          <div className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-[40px] md:rounded-[60px] bg-[#f9f9f9] border border-[#e8dcc8]/60 group">
            <div className="absolute inset-0">
              {activeImage.url ? (
                <Image
                  src={getImageUrl(activeImage.url)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9a8772]">
                  No Image
                </div>
              )}
            </div>

            {/* Reviews Badge */}
            <div className="absolute bottom-8 left-8">
              <a
                href="#ulasan"
                className="group/badge inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-lift-sm hover:bg-[#2d241c] hover:text-white transition-all transform hover:-translate-y-1"
              >
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded-full bg-[#f9f9f9] border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-[13px] font-black">
                  4.9 <span className="text-[#c85a2d] leading-none">★</span>
                </span>
                <span className="text-[12px] font-bold uppercase tracking-widest opacity-60 group-hover/badge:opacity-100">
                  Ulasan
                </span>
              </a>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-16 sm:h-24 sm:w-20 md:h-32 md:w-24 shrink-0 overflow-hidden rounded-2xl md:rounded-[32px] transition-all duration-500 ${
                    idx === activeImageIndex
                      ? "border-2 border-[#c85a2d] scale-95"
                      : "opacity-60 hover:opacity-100 border border-[#e8dcc8]/60"
                  }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={`Tampilan ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-[#c85a2d]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                100% Cotton Milk
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl leading-[0.95] tracking-tight font-black text-[#2d241c] uppercase">
              {product.name}
            </h1>
            <div className="mt-8 flex items-baseline gap-4">
              <p className="text-3xl md:text-4xl font-black tracking-tight text-[#c85a2d]">
                {formatCurrency(displayPrice)}
              </p>
              {accessoriesTotal > 0 && (
                <span className="text-lg font-bold text-[#6b5b4b] line-through opacity-40">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-10 pb-10 border-b border-[#e8dcc8]/40">
            <p className="text-[17px] md:text-[18px] leading-relaxed text-[#6b5b4b]">
              {product.description ||
                "Produk handmade berkualitas tinggi yang dirajut dengan penuh cinta oleh pengrajin lokal berbakat."}
            </p>
          </div>

          {/* New Pre-order Status */}
          <div className="mb-10 group cursor-default">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-[#c85a2d]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#3f3328]">
                Informasi Produksi
              </h3>
            </div>
            <div className="p-6 rounded-[32px] bg-[#f9f9f9] border border-[#e8dcc8]/50 group-hover:border-[#c85a2d]/30 transition-colors">
              <p className="text-[15px] leading-relaxed text-[#6b5b4b]">
                Semua produk kami dibuat{" "}
                <span className="text-[#3f3328] font-bold italic">
                  setelah pemesanan
                </span>{" "}
                (Made to Order).
              </p>
              <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-2xl ring-1 ring-black/5">
                <div className="h-2 w-2 rounded-full bg-[#c85a2d] animate-pulse" />
                <p className="text-[14px] font-bold text-[#c85a2d]">
                  ± 3 Minggu Waktu Pengerjaan
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <Suspense fallback={<AccessoriesSkeleton />}>
              <AccessoriesSelector
                onAccessoriesChange={handleAccessoriesChange}
              />
            </Suspense>

            <div className="space-y-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#6b5b4b] ml-1">
                Jumlah
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex justify-center sm:justify-start">
                  <div className="inline-flex items-center rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] p-1.5 h-14">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-11 w-11 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock ?? undefined}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="w-12 text-center text-[16px] font-bold text-[#3f3328] focus:outline-none bg-transparent"
                      aria-label="Jumlah"
                    />
                    <button
                      onClick={() =>
                        setQuantity(
                          product.stock != null
                            ? Math.min(product.stock, quantity + 1)
                            : quantity + 1,
                        )
                      }
                      className="h-11 w-11 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock != null && product.stock <= 0}
                  className="flex-1 min-h-[56px] md:min-h-[64px] inline-flex items-center justify-center gap-4 rounded-full bg-[#2d241c] text-white font-black text-[15px] uppercase tracking-widest shadow-lift-sm hover:bg-[#c85a2d] transition-all active:scale-[0.98] disabled:opacity-20"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Tambah ke Keranjang</span>
                </button>
              </div>
            </div>

            {/* Micro Benefits Grid */}
            <div className="pt-10 grid grid-cols-2 gap-8 border-t border-[#e8dcc8]/40">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8]/60 flex items-center justify-center text-[#c85a2d]">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-[14px] text-[#2d241c] uppercase tracking-wider mb-1">
                    Pengiriman Aman
                  </h4>
                  <p className="text-[12px] text-[#6b5b4b] leading-relaxed font-medium">
                    Dikemas dengan proteksi ekstra untuk dTeman Anda.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8]/60 flex items-center justify-center text-[#7a9d7f]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-[14px] text-[#2d241c] uppercase tracking-wider mb-1">
                    Garansi Retur
                  </h4>
                  <p className="text-[12px] text-[#6b5b4b] leading-relaxed font-medium">
                    7 hari jaminan kualitas produk dTeman Yoga.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section id="ulasan" className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>
          </section>
        }
      >
        <ProductReviews productSlug={product.slug} />
      </Suspense>
    </div>
  );
}
