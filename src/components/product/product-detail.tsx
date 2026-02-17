"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "@/components/review/product-reviews";
import type { ProductDetail as ProductDetailType, CartAccessory } from "@/types/api";

const AccessoriesSelector = dynamic(
  () => import("./accessories-selector").then((mod) => mod.AccessoriesSelector),
  {
    loading: () => (
      <div className="flex items-center gap-3 py-4">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-slate-200 rounded" />
      </div>
    ),
    ssr: false,
  }
);

function AccessoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-slate-200 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 rounded-2xl animate-pulse bg-slate-100" />
          <div className="h-16 rounded-2xl animate-pulse bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAccessories, setSelectedAccessories] = useState<CartAccessory[]>([]);
  const [accessoriesTotal, setAccessoriesTotal] = useState(0);

  const handleAccessoriesChange = useCallback((accessories: CartAccessory[], total: number) => {
    setSelectedAccessories(accessories);
    setAccessoriesTotal(total);
  }, []);

  const images = product.images.length > 0 ? product.images : [{ url: "", id: "fallback" }];
  const activeImage = images[activeImageIndex];
  const displayPrice = Number(product.price) + accessoriesTotal;

  const handleAddToCart = () => {
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
    toast.success("Produk berhasil ditambahkan ke keranjang");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16" id="top">
      <section className="pt-6 md:pt-8">
        <nav className="flex items-center gap-2 md:gap-3 text-[12px] md:text-[14px] font-medium text-[#6b5b4b]">
          <Link href="/" className="hover:text-[#c85a2d] transition-colors shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#9a8772] shrink-0" />
          <Link href="/products" className="hover:text-[#c85a2d] transition-colors shrink-0">
            Produk
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#9a8772] shrink-0" />
          <span className="font-bold text-[#3f3328] truncate max-w-[150px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </section>

      <section className="pt-6 md:pt-10 grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20 animate-floatIn">
        <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24 self-start">
          <div className="relative aspect-square overflow-hidden rounded-[32px] md:rounded-[40px] bg-white ring-1 ring-[#e8dcc8] shadow-soft group">
            <div className="absolute inset-0 bg-[#f5f1ed]">
              {activeImage.url ? (
                <Image
                  src={getImageUrl(activeImage.url)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  No Image
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-[#e8dcc8] px-3 py-1.5 md:px-4 md:py-2 shadow-soft">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#c85a2d] fill-[#c85a2d]" />
              <a href="#ulasan" className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] hover:text-[#c85a2d] transition-colors">
                Lihat Ulasan
              </a>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-2xl md:rounded-3xl ring-2 transition-all duration-300 ${
                    idx === activeImageIndex
                      ? "ring-[#c85a2d] scale-95"
                      : "ring-transparent hover:ring-[#e8dcc8]"
                  }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={`Tampilan ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col py-0 lg:py-2">
          <div className="mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 px-3 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#c85a2d] animate-pulse"></span>
              <span className="text-[10px] md:text-[11px] font-bold text-[#c85a2d] uppercase tracking-wider">Tersedia Sekarang</span>
            </div>
            <h1 className="font-display text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] leading-[1.1] tracking-tight font-black text-slate-900">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 md:gap-6">
              <p className="text-[24px] sm:text-[28px] md:text-[36px] font-black tracking-tight text-[#c85a2d]">
                {formatCurrency(displayPrice)}
              </p>
              {accessoriesTotal > 0 && (
                <span className="text-[13px] md:text-[14px] font-medium text-[#6b5b4b] line-through">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
              <div className="hidden sm:block h-8 w-px bg-[#e8dcc8]"></div>
              <div className="flex items-center gap-1.5 text-[13px] md:text-sm font-bold text-[#7a9d7f]">
                <ShieldCheck className="w-4 h-4" />
                <span>Original Handmade</span>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-8 md:mb-10">
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#6b5b4b]">
              {product.description ||
                "Produk handmade berkualitas tinggi yang dirajut dengan penuh cinta oleh pengrajin lokal berbakat."}
            </p>
          </div>

          <div className="space-y-8">
            <Suspense fallback={<AccessoriesSkeleton />}>
              <AccessoriesSelector onAccessoriesChange={handleAccessoriesChange} />
            </Suspense>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center rounded-full bg-white ring-1 ring-[#e8dcc8] shadow-sm p-1 md:p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 md:h-11 md:w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-4 h-4 md:w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock ?? undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-10 md:w-12 text-center text-[15px] md:text-[16px] font-bold text-[#3f3328] focus:outline-none bg-transparent"
                    aria-label="Jumlah"
                  />
                  <button
                    onClick={() =>
                      setQuantity(product.stock != null ? Math.min(product.stock, quantity + 1) : quantity + 1)
                    }
                    className="h-10 w-10 md:h-11 md:w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="w-4 h-4 md:w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock != null && product.stock <= 0}
                className="flex-1 min-h-[56px] md:min-h-[60px] inline-flex items-center justify-center gap-3 rounded-full bg-[#c85a2d] text-white font-black text-[15px] md:text-[16px] shadow-soft hover:bg-[#b04a25] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>

            <div className="pt-6 md:pt-8 grid grid-cols-2 gap-3 md:gap-4 border-t border-[#e8dcc8]">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 md:p-4 rounded-3xl bg-white/50 ring-1 ring-[#e8dcc8]/50 text-center sm:text-left">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-[#7a9d7f]/10 text-[#7a9d7f] grid place-items-center shrink-0">
                  <Truck className="w-4 h-4 md:w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] md:text-[13px] font-bold text-[#3f3328]">Pengiriman Cepat</p>
                  <p className="text-[11px] md:text-[12px] text-[#6b5b4b]">Estimasi 1-3 hari</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 md:p-4 rounded-3xl bg-white/50 ring-1 ring-[#e8dcc8]/50 text-center sm:text-left">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-[#c85a2d]/10 text-[#c85a2d] grid place-items-center shrink-0">
                  <RotateCcw className="w-4 h-4 md:w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] md:text-[13px] font-bold text-[#3f3328]">Garansi Retur</p>
                  <p className="text-[11px] md:text-[12px] text-[#6b5b4b]">7 hari pengembalian</p>
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