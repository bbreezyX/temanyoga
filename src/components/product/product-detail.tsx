"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  Pencil,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "@/components/review/product-reviews";
import type {
  ProductDetail as ProductDetailType,
  CartAccessory,
  CartItem,
} from "@/types/api";

const AccessoriesSelector = dynamic(
  () => import("./accessories-selector").then((mod) => mod.AccessoriesSelector),
  {
    loading: () => (
      <div className="flex items-center gap-3 py-2">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-[#f9f9f9] rounded" />
      </div>
    ),
    ssr: false,
  },
);

function AccessoriesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded animate-pulse bg-[#c85a2d]/20" />
        <div className="h-4 w-32 animate-pulse bg-[#f9f9f9] rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse bg-[#f9f9f9] rounded" />
        <div className="grid grid-cols-1 gap-2">
          <div className="h-14 rounded-2xl animate-pulse bg-[#f9f9f9]" />
          <div className="h-14 rounded-2xl animate-pulse bg-[#f9f9f9]" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const searchParams = useSearchParams();
  const { items, getItemKey, isLoaded } = useCart();

  const editLineId = searchParams.get("item");
  const editingCartItem = isLoaded
    ? items.find(
        (item) => item.cartLineId === editLineId && item.productId === product.id,
      ) ?? null
    : null;
  const selectionKey = editingCartItem ? getItemKey(editingCartItem) : "new";

  return (
    <ProductDetailContent
      key={`${product.id}:${selectionKey}`}
      product={product}
      editLineId={editLineId}
      editingCartItem={editingCartItem}
      selectionKey={selectionKey}
    />
  );
}

function ProductDetailContent({
  product,
  editLineId,
  editingCartItem,
  selectionKey,
}: {
  product: ProductDetailType;
  editLineId: string | null;
  editingCartItem: CartItem | null;
  selectionKey: string;
}) {
  const router = useRouter();
  const { addItem, replaceItem, getItemKey } = useCart();
  const [quantity, setQuantity] = useState(editingCartItem?.quantity ?? 1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAccessories, setSelectedAccessories] = useState<
    CartAccessory[]
  >([]);
  const [accessoriesTotal, setAccessoriesTotal] = useState(0);
  const isEditingCartItem = !!editingCartItem;

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
  const isOutOfStock = product.stock != null && product.stock <= 0;

  const handleAddToCart = () => {
    // Defer cart update to next frame to ensure toast appears instantly
    requestAnimationFrame(() => {
      const nextItem = {
        cartLineId: editingCartItem?.cartLineId ?? "",
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.images[0]?.url ?? null,
        quantity,
        stock: product.stock,
        accessories: selectedAccessories,
      };

      if (editingCartItem && editLineId) {
        replaceItem(getItemKey(editingCartItem), nextItem);
        router.push("/cart");
        return;
      }

      addItem(nextItem);
    });
  };

  return (
    <>
      <div
        className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 lg:pb-24"
        id="top"
      >
        {/* Breadcrumb */}
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
            <span className="font-bold text-[#2d241c] truncate">
              {product.name}
            </span>
          </nav>
        </section>

        {/* Main grid */}
        <section className="pt-8 md:pt-14 grid gap-10 lg:grid-cols-12 lg:gap-16 animate-floatIn">
          {/* LEFT — Gallery */}
          <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-32 self-start">
            <div className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-[40px] bg-[#f5f1ed] border border-[#e8dcc8]/70 group">
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

              {/* Reviews badge */}
              <div className="absolute bottom-6 left-6">
                <a
                  href="#ulasan"
                  className="group/badge inline-flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur px-4 py-2.5 shadow-lift-sm hover:bg-[#2d241c] hover:text-white transition-all hover:-translate-y-0.5"
                >
                  <span className="text-[13px] font-black">
                    4.9{" "}
                    <span className="text-[#c85a2d] group-hover/badge:text-white leading-none">
                      ★
                    </span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest opacity-60 group-hover/badge:opacity-100">
                    Ulasan
                  </span>
                </a>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-16 sm:h-24 sm:w-20 md:h-28 md:w-24 shrink-0 overflow-hidden rounded-[20px] transition-all duration-500 ${
                      idx === activeImageIndex
                        ? "ring-2 ring-[#c85a2d] ring-offset-2 ring-offset-white"
                        : "opacity-60 hover:opacity-100 border border-[#e8dcc8]/70"
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

          {/* RIGHT — Purchase panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Block 1 — Title + price */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-[#c85a2d]" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                  100% Cotton Milk
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-[#2d241c] uppercase">
                {product.name}
              </h1>
              <div className="mt-6 flex items-baseline gap-4">
                <p className="text-3xl md:text-4xl font-black tracking-tight text-[#c85a2d]">
                  {formatCurrency(displayPrice)}
                </p>
                {accessoriesTotal > 0 && (
                  <span className="text-lg font-bold text-[#9a8772] line-through">
                    {formatCurrency(Number(product.price))}
                  </span>
                )}
              </div>
            </div>

            {/* Block 2 — Description */}
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#6b5b4b]">
              {product.description ||
                "Produk handmade berkualitas tinggi yang dirajut dengan penuh cinta oleh pengrajin lokal berbakat."}
            </p>

            {/* Block 3 — Buy box */}
            <div className="rounded-[32px] border border-[#e8dcc8]/70 bg-white shadow-soft p-6 md:p-7 space-y-7">
              <Suspense fallback={<AccessoriesSkeleton />}>
                <AccessoriesSelector
                  key={selectionKey}
                  onAccessoriesChange={handleAccessoriesChange}
                  initialAccessories={editingCartItem?.accessories ?? []}
                />
              </Suspense>

              {/* Quantity */}
              <div className="space-y-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#6b5b4b]">
                  Jumlah
                </p>
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
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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

              {/* Made to order strip */}
              <div className="flex items-center gap-3 rounded-2xl bg-[#fdf8f6] border border-[#c85a2d]/15 px-4 py-3">
                <Clock className="w-4 h-4 text-[#c85a2d] shrink-0" />
                <p className="text-[13px] leading-snug text-[#6b5b4b]">
                  <span className="font-bold text-[#2d241c]">Made to Order</span>{" "}
                  — dibuat setelah pemesanan, estimasi pengerjaan{" "}
                  <span className="font-bold text-[#c85a2d]">±3 minggu</span>.
                </p>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full min-h-[56px] md:min-h-[60px] inline-flex items-center justify-center gap-3 rounded-full bg-[#c85a2d] text-white font-black text-[15px] uppercase tracking-widest shadow-lift hover:bg-[#2d241c] transition-all active:scale-[0.98] disabled:opacity-30"
              >
                {isEditingCartItem ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>
                  {isOutOfStock
                    ? "Stok Habis"
                    : isEditingCartItem
                      ? "Simpan Perubahan"
                      : "Tambah ke Keranjang"}
                </span>
              </button>
            </div>

            {/* Benefits — slim row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-2xl border border-[#e8dcc8]/60 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#f9f9f9] border border-[#e8dcc8]/60 flex items-center justify-center text-[#c85a2d] shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-[12px] text-[#2d241c] uppercase tracking-wider">
                    Pengiriman Aman
                  </h4>
                  <p className="text-[11px] text-[#6b5b4b] leading-relaxed mt-0.5">
                    Dikemas dengan proteksi ekstra.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#e8dcc8]/60 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#f9f9f9] border border-[#e8dcc8]/60 flex items-center justify-center text-[#7a9d7f] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-[12px] text-[#2d241c] uppercase tracking-wider">
                    Garansi Retur
                  </h4>
                  <p className="text-[11px] text-[#6b5b4b] leading-relaxed mt-0.5">
                    7 hari jaminan kualitas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <Suspense
          fallback={
            <section
              id="ulasan"
              className="mt-16 pt-8 border-t border-[#e8dcc8]/60"
            >
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

      {/* Sticky mobile buy bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#e8dcc8] bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8772] leading-none">
              Total
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#c85a2d] leading-none">
              {formatCurrency(displayPrice)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full bg-[#c85a2d] text-white font-black text-[14px] uppercase tracking-widest shadow-lift-sm hover:bg-[#2d241c] transition-all active:scale-[0.98] disabled:opacity-30"
          >
            {isEditingCartItem ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>
              {isOutOfStock ? "Habis" : isEditingCartItem ? "Simpan" : "Tambah"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
