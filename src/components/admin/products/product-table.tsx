"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Pencil,
  ImagePlus,
  EyeOff,
  Eye,
  ImageIcon,
  Trash2,
  Camera,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { apiPatch, apiDelete } from "@/lib/api-client";
import { ImageUpload } from "./image-upload";
import type { AdminProductListItem } from "@/types/api";

interface ProductTableProps {
  products: AdminProductListItem[];
  totalCount: number;
  onEdit: (product: AdminProductListItem) => void;
  onRefresh: () => void;
  viewMode?: "grid" | "list";
}

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600 ring-1 ring-blue-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        Unlimited
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
        Habis
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600 ring-1 ring-amber-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        Stok Rendah ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-[11px] font-bold text-sage ring-1 ring-sage/20">
      <span className="h-1.5 w-1.5 rounded-full bg-sage" />
      Tersedia ({stock})
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <div className="flex items-center gap-2 group/status drop-shadow-sm">
        <div className="relative flex h-2.5 w-2.5">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
            style={{ backgroundColor: '#10b981' }}
          ></span>
          <span 
            className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
            style={{ backgroundColor: '#10b981' }}
          ></span>
        </div>
        <span 
          className="text-[10px] font-black uppercase tracking-[0.2em] select-none"
          style={{ 
            color: '#065f46',
            textShadow: '0 1px 1px rgba(255,255,255,0.5)'
          }}
        >
          Publish
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 group/status opacity-90">
      <div className="relative flex h-2.5 w-2.5">
        <span 
          className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-[0_0_8px_rgba(107,91,75,0.3)]" 
          style={{ backgroundColor: '#6b5b4b' }}
        ></span>
      </div>
      <span 
        className="text-[10px] font-black uppercase tracking-[0.2em] select-none"
        style={{ color: '#6b5b4b' }}
      >
        Draft
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-warm-gray">
      <div className="h-20 w-20 rounded-3xl bg-cream flex items-center justify-center">
        <ImageIcon className="h-10 w-10 text-warm-sand" />
      </div>
      <div className="text-center">
        <p className="font-bold text-dark-brown">Belum ada produk</p>
        <p className="text-sm mt-1">
          Tambah produk pertamamu dengan tombol di atas.
        </p>
      </div>
    </div>
  );
}

export function ProductTable({
  products,
  totalCount,
  onEdit,
  onRefresh,
  viewMode = "grid",
}: ProductTableProps) {
  const toast = useToast();
  const [imageDialogProduct, setImageDialogProduct] =
    useState<AdminProductListItem | null>(null);

  async function toggleActive(product: AdminProductListItem) {
    const res = await apiPatch(`/api/admin/products/${product.id}`, {
      isActive: !product.isActive,
    });
    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success(
      product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan",
    );
    onRefresh();
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm("Hapus gambar ini?")) return;

    const res = await apiDelete(`/api/admin/products/images/${imageId}`);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Gambar berhasil dihapus");
    onRefresh();
    if (imageDialogProduct) {
      setImageDialogProduct({
        ...imageDialogProduct,
        images: imageDialogProduct.images.filter((img) => img.id !== imageId),
      });
    }
  }

  return (
    <>
      {/* ── GRID VIEW ─────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div>
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`group rounded-3xl bg-card ring-1 overflow-hidden shadow-soft hover:shadow-md transition-all duration-200 flex flex-col ${
                    product.isActive
                      ? "ring-warm-sand/30"
                      : "ring-warm-sand/30 opacity-70"
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-cream overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={getImageUrl(product.images[0].url)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-warm-gray/40">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-[11px] font-medium">Belum ada foto</span>
                      </div>
                    )}
                    {/* Status indicator on image */}
                    <div className="absolute top-3 left-3 z-10">
                      <StatusBadge isActive={product.isActive} />
                    </div>
                    {/* Photo count badge */}
                    {product.images.length > 0 && (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <Camera className="h-3 w-3" />
                        {product.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <div>
                      <h3 className="font-display font-bold text-dark-brown text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-display font-extrabold text-dark-brown text-base">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <StockBadge stock={product.stock} />
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warm-gray bg-cream px-2 py-0.5 rounded-full">
                          <ShoppingBag className="h-2.5 w-2.5" />
                          {product._count.orderItems} terjual
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-3 pb-3 flex flex-col gap-2 border-t border-warm-sand/20 pt-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cream px-2 py-2 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" />
                        Edit
                      </button>
                      <button
                        onClick={() => setImageDialogProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cream px-2 py-2 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                      >
                        <ImagePlus className="h-3.5 w-3.5 shrink-0" />
                        Foto
                        {product.images.length > 0 && (
                          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-terracotta/20 text-terracotta text-[10px] font-black">
                            {product.images.length}
                          </span>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleActive(product)}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-all ring-1 ${
                        product.isActive
                          ? "bg-sage/10 text-sage ring-sage/20 hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                          : "bg-cream text-warm-gray ring-warm-sand/30 hover:bg-sage/10 hover:text-sage hover:ring-sage/20"
                      }`}
                    >
                      {product.isActive ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Aktifkan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {products.length > 0 && (
            <p className="text-xs font-bold text-warm-gray mt-4 text-center">
              Menampilkan {products.length} dari {totalCount} produk
            </p>
          )}
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────── */}
      {viewMode === "list" && (
        <div className="rounded-[32px] bg-card shadow-soft ring-1 ring-warm-sand/30 overflow-hidden">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream/50 border-b border-warm-sand/50">
                    <tr className="text-[11px] font-black uppercase tracking-[0.1em] text-warm-gray">
                      <th className="py-5 pl-6 lg:pl-8">Produk</th>
                      <th className="py-5">Harga</th>
                      <th className="py-5">Stok</th>
                      <th className="py-5">Status</th>
                      <th className="py-5 text-center">Terjual</th>
                      <th className="py-5 pr-6 lg:pr-8 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-sand/20">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="group hover:bg-cream/30 transition-colors"
                      >
                        <td className="py-4 pl-6 lg:pl-8">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 rounded-2xl bg-warm-sand/50 flex items-center justify-center overflow-hidden ring-1 ring-warm-sand/50 relative">
                              {product.images[0] ? (
                                <Image
                                  src={getImageUrl(product.images[0].url)}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-warm-gray/40" />
                              )}
                              {product.images.length > 1 && (
                                <div className="absolute bottom-0.5 right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-black/50 text-white text-[9px] font-bold">
                                  +{product.images.length - 1}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-bold text-dark-brown truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-warm-gray mt-0.5 truncate max-w-[220px]">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-dark-brown">
                            {formatCurrency(product.price)}
                          </span>
                        </td>
                        <td className="py-4">
                          <StockBadge stock={product.stock} />
                        </td>
                        <td className="py-4">
                          <StatusBadge isActive={product.isActive} />
                        </td>
                        <td className="py-4 text-center">
                          <span className="font-bold text-dark-brown tabular-nums">
                            {product._count.orderItems}
                          </span>
                        </td>
                        <td className="py-4 pr-6 lg:pr-8">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(product)}
                              className="flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setImageDialogProduct(product)}
                              className="flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                            >
                              <ImagePlus className="h-3.5 w-3.5" />
                              Foto
                              {product.images.length > 0 && (
                                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-terracotta/20 text-terracotta text-[10px] font-black">
                                  {product.images.length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => toggleActive(product)}
                              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ring-1 ${
                                product.isActive
                                  ? "bg-sage/10 text-sage ring-sage/20 hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                                  : "bg-cream text-warm-gray ring-warm-sand/30 hover:bg-sage/10 hover:text-sage hover:ring-sage/20"
                              }`}
                            >
                              {product.isActive ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  Aktifkan
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (always used on small screens) */}
              <div className="md:hidden divide-y divide-warm-sand/20">
                {products.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 rounded-2xl bg-warm-sand/50 overflow-hidden ring-1 ring-warm-sand/50 relative flex items-center justify-center">
                        {product.images[0] ? (
                          <Image
                            src={getImageUrl(product.images[0].url)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-warm-gray/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-display font-bold text-dark-brown truncate">
                            {product.name}
                          </h3>
                          <StatusBadge isActive={product.isActive} />
                        </div>
                        <p className="text-[11px] text-warm-gray mt-0.5 truncate">
                          {product.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <StockBadge stock={product.stock} />
                          <span className="text-[10px] font-bold text-warm-gray px-2 py-0.5 rounded-full bg-cream">
                            {product._count.orderItems} Terjual
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-warm-sand/20 flex items-center justify-between gap-2">
                      <span className="font-display font-extrabold text-dark-brown">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(product)}
                          className="flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setImageDialogProduct(product)}
                          className="flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                        >
                          <ImagePlus className="h-3.5 w-3.5" />
                          Foto
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ring-1 ${
                            product.isActive
                              ? "bg-sage/10 text-sage ring-sage/20"
                              : "bg-cream text-warm-gray ring-warm-sand/30"
                          }`}
                        >
                          {product.isActive ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-cream/30 px-6 lg:px-8 py-4 border-t border-warm-sand/30 text-sm font-bold text-warm-gray">
                Menampilkan {products.length} dari {totalCount} produk
              </div>
            </>
          )}
        </div>
      )}

      {/* ── IMAGE DIALOG ──────────────────────────────────────── */}
      <Dialog
        open={!!imageDialogProduct}
        onOpenChange={(v) => !v && setImageDialogProduct(null)}
      >
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-dark-brown">
              Kelola Foto — {imageDialogProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {imageDialogProduct && (
            <div className="space-y-5">
              {imageDialogProduct.images.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-warm-gray">
                  <div className="h-14 w-14 rounded-2xl bg-cream flex items-center justify-center">
                    <Camera className="h-7 w-7 text-warm-sand" />
                  </div>
                  <p className="text-sm font-medium">Belum ada foto untuk produk ini.</p>
                  <p className="text-xs text-warm-gray/70">Upload foto agar pembeli bisa melihat produk.</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-warm-gray mb-3">
                    Foto saat ini ({imageDialogProduct.images.length})
                    <span className="ml-1 font-normal">— Arahkan ke foto untuk menghapus</span>
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imageDialogProduct.images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-warm-sand/50"
                      >
                        <Image
                          src={getImageUrl(img.url)}
                          alt={`Foto ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-terracotta text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            Utama
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          aria-label="Hapus foto"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="text-[10px] font-bold">Hapus</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-cream p-4 space-y-3">
                <p className="text-xs font-bold text-dark-brown">Tambah Foto Baru</p>
                <p className="text-[11px] text-warm-gray">Format: JPG, PNG, WebP. Maksimal 5 MB per foto.</p>
                <ImageUpload
                  productId={imageDialogProduct.id}
                  onUploaded={(newImage) => {
                    setImageDialogProduct({
                      ...imageDialogProduct,
                      images: [...imageDialogProduct.images, newImage],
                    });
                    onRefresh();
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
