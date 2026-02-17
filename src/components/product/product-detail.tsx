"use client";

import { useState, useEffect } from "react";
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
  Puzzle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import { apiFetch } from "@/lib/api-client";
import { ProductReviews } from "@/components/review/product-reviews";
import type {
  ProductDetail as ProductDetailType,
  AccessoryItem,
  CartAccessory,
} from "@/types/api";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accessories
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [accessoriesLoading, setAccessoriesLoading] = useState(true);
  const [selectedAccessories, setSelectedAccessories] = useState<
    Map<string, string>
  >(new Map()); // groupName -> accessoryId for groups
  const [selectedIndependent, setSelectedIndependent] = useState<Set<string>>(
    new Set()
  ); // accessoryId for independent

  useEffect(() => {
    async function loadAccessories() {
      const res = await apiFetch<AccessoryItem[]>("/api/accessories");
      if (res.success) {
        setAccessories(res.data);
      }
      setAccessoriesLoading(false);
    }
    loadAccessories();
  }, []);

  // Fallback if no images
  const images =
    product.images.length > 0 ? product.images : [{ url: "", id: "fallback" }];
  const activeImage = images[activeImageIndex];

  // Group accessories by groupName
  const groups = new Map<string, AccessoryItem[]>();
  const independentAccessories: AccessoryItem[] = [];
  for (const acc of accessories) {
    if (acc.groupName) {
      if (!groups.has(acc.groupName)) groups.set(acc.groupName, []);
      groups.get(acc.groupName)!.push(acc);
    } else {
      independentAccessories.push(acc);
    }
  }

  // Calculate selected accessories total
  const getSelectedAccessoriesList = (): CartAccessory[] => {
    const result: CartAccessory[] = [];
    for (const [, accId] of selectedAccessories) {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) result.push({ id: acc.id, name: acc.name, price: acc.price, groupName: acc.groupName });
    }
    for (const accId of selectedIndependent) {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) result.push({ id: acc.id, name: acc.name, price: acc.price, groupName: acc.groupName });
    }
    return result;
  };

  const selectedAccList = getSelectedAccessoriesList();
  const accessoriesTotal = selectedAccList.reduce((s, a) => s + a.price, 0);
  const displayPrice = Number(product.price) + accessoriesTotal;

  const handleGroupSelect = (groupName: string, accId: string | null) => {
    setSelectedAccessories((prev) => {
      const next = new Map(prev);
      if (accId) {
        next.set(groupName, accId);
      } else {
        next.delete(groupName);
      }
      return next;
    });
  };

  const handleIndependentToggle = (accId: string) => {
    setSelectedIndependent((prev) => {
      const next = new Set(prev);
      if (next.has(accId)) {
        next.delete(accId);
      } else {
        next.add(accId);
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0]?.url ?? null,
      quantity,
      stock: product.stock,
      accessories: selectedAccList,
    });
    toast.success("Produk berhasil ditambahkan ke keranjang");
  };

  return (
    <div
      className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16"
      id="top"
    >
      {/* Breadcrumb - Responsive Padding */}
      <section className="pt-6 md:pt-8">
        <nav className="flex items-center gap-2 md:gap-3 text-[12px] md:text-[14px] font-medium text-[#6b5b4b]">
          <Link href="/" className="hover:text-[#c85a2d] transition-colors shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#9a8772] shrink-0" />
          <Link
            href="/products"
            className="hover:text-[#c85a2d] transition-colors shrink-0"
          >
            Produk
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#9a8772] shrink-0" />
          <span className="font-bold text-[#3f3328] truncate max-w-[150px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </section>

      {/* Main Product Section - Responsive Grid */}
      <section className="pt-6 md:pt-10 grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20 animate-floatIn">
        {/* Image Gallery - Sticky on Desktop */}
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

            {/* Floating Badge - Responsive Sizing */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-[#e8dcc8] px-3 py-1.5 md:px-4 md:py-2 shadow-soft">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#c85a2d] fill-[#c85a2d]" />
              <a href="#ulasan" className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] hover:text-[#c85a2d] transition-colors">
                Lihat Ulasan
              </a>
            </div>
          </div>

          {/* Thumbnails - Horizontal Scroll for Mobile */}
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
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Better Spacing for Smaller Screens */}
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
            {/* Accessories Selection - Mobile Friendly Labels */}
            {accessoriesLoading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#c85a2d]" />
                <span className="text-[14px] text-[#6b5b4b]">Memuat aksesoris...</span>
              </div>
            ) : accessories.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Puzzle className="w-5 h-5 text-[#c85a2d]" />
                  <span className="text-[13px] md:text-[14px] font-black text-[#3f3328] uppercase tracking-wider">
                    Pilih Aksesoris
                  </span>
                </div>

                {/* Grouped accessories (radio) - Responsive Card Grid */}
                {[...groups.entries()].map(([groupName, groupItems]) => (
                  <div key={groupName} className="space-y-3">
                    <p className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] uppercase tracking-wider">
                      {groupName}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                      {/* None option */}
                      <label
                        className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                          !selectedAccessories.has(groupName)
                            ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                            : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`group-${groupName}`}
                          checked={!selectedAccessories.has(groupName)}
                          onChange={() => handleGroupSelect(groupName, null)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full ring-2 shrink-0 flex items-center justify-center transition-all ${
                            !selectedAccessories.has(groupName)
                              ? "ring-[#c85a2d] bg-[#c85a2d]"
                              : "ring-[#d4c5b3] bg-white"
                          }`}
                        >
                          {!selectedAccessories.has(groupName) && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[13px] md:text-[14px] text-[#6b5b4b]">Tidak ada</p>
                        </div>
                        <span className="text-[13px] md:text-[14px] font-bold text-[#9a8772]">—</span>
                      </label>
                      {groupItems.map((acc) => {
                        const isSelected = selectedAccessories.get(groupName) === acc.id;
                        return (
                          <label
                            key={acc.id}
                            className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                              isSelected
                                ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                                : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`group-${groupName}`}
                              checked={isSelected}
                              onChange={() => handleGroupSelect(groupName, acc.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full ring-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "ring-[#c85a2d] bg-[#c85a2d]"
                                  : "ring-[#d4c5b3] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[13px] md:text-[14px] text-slate-900 truncate">{acc.name}</p>
                              {acc.description && (
                                <p className="text-[11px] md:text-[12px] text-[#6b5b4b] mt-0.5 line-clamp-1">{acc.description}</p>
                              )}
                            </div>
                            <span className="font-black text-[13px] md:text-[14px] text-[#c85a2d] shrink-0">
                              +{formatCurrency(acc.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Independent accessories (checkboxes) */}
                {independentAccessories.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] uppercase tracking-wider">
                      Tambahan
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                      {independentAccessories.map((acc) => {
                        const isSelected = selectedIndependent.has(acc.id);
                        return (
                          <label
                            key={acc.id}
                            className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                              isSelected
                                ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                                : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleIndependentToggle(acc.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-md ring-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "ring-[#c85a2d] bg-[#c85a2d]"
                                  : "ring-[#d4c5b3] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[13px] md:text-[14px] text-slate-900 truncate">{acc.name}</p>
                              {acc.description && (
                                <p className="text-[11px] md:text-[12px] text-[#6b5b4b] mt-0.5 line-clamp-1">{acc.description}</p>
                              )}
                            </div>
                            <span className="font-black text-[13px] md:text-[14px] text-[#c85a2d] shrink-0">
                              +{formatCurrency(acc.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected summary */}
                {selectedAccList.length > 0 && (
                  <div className="rounded-2xl bg-[#7a9d7f]/10 ring-1 ring-[#7a9d7f]/20 p-4">
                    <p className="text-[11px] md:text-[12px] font-bold text-[#5a6a58] uppercase tracking-wider mb-2">
                      Aksesoris Terpilih
                    </p>
                    <div className="space-y-1">
                      {selectedAccList.map((acc) => (
                        <div key={acc.id} className="flex justify-between text-[12px] md:text-[13px]">
                          <span className="text-[#3f3328] font-medium">{acc.name}</span>
                          <span className="text-[#7a9d7f] font-bold">+{formatCurrency(acc.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart - Better Mobile Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center rounded-full bg-white ring-1 ring-[#e8dcc8] shadow-sm p-1 md:p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 md:h-11 md:w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
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
                  />
                  <button
                    onClick={() =>
                      setQuantity(product.stock != null ? Math.min(product.stock, quantity + 1) : quantity + 1)
                    }
                    className="h-10 w-10 md:h-11 md:w-11 grid place-items-center rounded-full hover:bg-[#f5f1ed] text-[#5a4a3b] transition-colors"
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

            {/* Service Badges - Responsive Grid */}
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

      <ProductReviews productSlug={product.slug} />
    </div>
  );
}
