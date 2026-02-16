"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import type { ProductDetail as ProductDetailType } from "@/types/api";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fallback if no images
  const images =
    product.images.length > 0 ? product.images : [{ url: "", id: "fallback" }];
  const activeImage = images[activeImageIndex];

  // Mock colors for now as they are not in the DB schema yet, or use a default
  const colors = [
    { name: "Terracotta", value: "#c85a2d" },
    { name: "Sand", value: "#e8dcc8" },
    { name: "Sage", value: "#7a9d7f" },
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0]?.url ?? null,
      quantity,
      stock: product.stock,
    });
    // setIsOpen(true); // Cart sheet control is not in context yet
    toast.success("Produk berhasil ditambahkan ke keranjang");
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-6 md:px-8 pb-16 w-full max-w-7xl mx-auto"
      id="top"
    >
      {/* Breadcrumb */}
      <section className="pt-8">
        <nav className="flex items-center gap-3 text-[14px] font-medium text-[#6b5b4b]">
          <Link href="/" className="hover:text-[#c85a2d] transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-4 h-4 text-[#9a8772]" />
          <Link
            href="/products"
            className="hover:text-[#c85a2d] transition-colors"
          >
            Produk
          </Link>
          <ChevronRight className="w-4 h-4 text-[#9a8772]" />
          <span className="font-bold text-[#3f3328] truncate">
            {product.name}
          </span>
        </nav>
      </section>

      {/* Main Product Section */}
      <section className="pt-8 grid gap-10 lg:grid-cols-2 lg:gap-20 animate-floatIn">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-[40px] bg-white ring-1 ring-[#e8dcc8] shadow-soft group">
            <div className="absolute inset-0 bg-[#f5f1ed]">
              {activeImage.url ? (
                <Image
                  src={getImageUrl(activeImage.url)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  No Image
                </div>
              )}
            </div>

            {/* Floating Badge */}
            <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-[#e8dcc8] px-4 py-2 shadow-soft">
              <Star className="w-4 h-4 text-[#c85a2d] fill-[#c85a2d]" />
              <span className="text-[13px] font-bold text-[#5a4a3b]">
                4.9 (128 ulasan)
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl ring-2 transition-all duration-300 ${
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
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col py-2">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 px-3 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#c85a2d] animate-pulse"></span>
              <span className="text-[11px] font-bold text-[#c85a2d] uppercase tracking-wider">Tersedia Sekarang</span>
            </div>
            <h1 className="font-display text-[32px] md:text-[44px] lg:text-[52px] leading-[1.1] tracking-tight font-black text-slate-900">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-[28px] md:text-[36px] font-black tracking-tight text-[#c85a2d]">
                {formatCurrency(Number(product.price))}
              </p>
              <div className="h-8 w-px bg-[#e8dcc8]"></div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#7a9d7f]">
                <ShieldCheck className="w-4 h-4" />
                <span>Original Handmade</span>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-10">
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#6b5b4b]">
              {product.description ||
                "Tingkatkan latihanmu dengan peralatan berkualitas tinggi yang dibuat dengan tangan oleh pengrajin lokal berbakat."}
            </p>
          </div>

          <div className="space-y-8">
            {/* Color Selection (Mocked) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-black text-[#3f3328] uppercase tracking-wider">
                  Pilih Warna
                </span>
                <span className="text-[13px] font-medium text-[#7a6a58]">
                  Warna: <span className="font-bold text-[#c85a2d]">{selectedColor.name}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative flex items-center justify-center rounded-full bg-white px-5 py-3 shadow-soft ring-1 transition-all transform hover:-translate-y-0.5 ${
                      selectedColor.name === color.name
                        ? "ring-[#c85a2d] bg-[#fdf8f6]"
                        : "ring-[#e8dcc8] hover:ring-[#c85a2d]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-5 w-5 rounded-full ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: color.value }}
                      />
                      <span
                        className={`text-[14px] font-bold ${
                          selectedColor.name === color.name
                            ? "text-[#c85a2d]"
                            : "text-[#5a4a3b]"
                        }`}
                      >
                        {color.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-full bg-white ring-1 ring-[#e8dcc8] shadow-sm p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-11 w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock ?? undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-12 text-center text-[16px] font-bold text-[#3f3328] focus:outline-none bg-transparent"
                  />
                  <button
                    onClick={() =>
                      setQuantity(product.stock != null ? Math.min(product.stock, quantity + 1) : quantity + 1)
                    }
                    className="h-11 w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock != null && product.stock <= 0}
                className="flex-1 min-h-[60px] inline-flex items-center justify-center gap-3 rounded-full bg-[#c85a2d] text-white font-black text-[16px] shadow-soft hover:bg-[#b04a25] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>

            {/* Service Badges */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#e8dcc8]">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 ring-1 ring-[#e8dcc8]/50">
                <div className="w-10 h-10 rounded-2xl bg-[#7a9d7f]/10 text-[#7a9d7f] grid place-items-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#3f3328]">Pengiriman Cepat</p>
                  <p className="text-[12px] text-[#6b5b4b]">Estimasi 1-3 hari kerja</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 ring-1 ring-[#e8dcc8]/50">
                <div className="w-10 h-10 rounded-2xl bg-[#c85a2d]/10 text-[#c85a2d] grid place-items-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#3f3328]">Garansi Retur</p>
                  <p className="text-[12px] text-[#6b5b4b]">7 hari pengembalian</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
