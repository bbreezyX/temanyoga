"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, ImagePlus, EyeOff, Eye, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { apiPatch } from "@/lib/api-client";
import { ImageUpload } from "./image-upload";
import type { AdminProductListItem } from "@/types/api";

interface ProductTableProps {
  products: AdminProductListItem[];
  totalCount: number;
  onEdit: (product: AdminProductListItem) => void;
  onRefresh: () => void;
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
      <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-3 py-1 text-[11px] font-bold text-sage ring-1 ring-sage/20">
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warm-gray/10 px-3 py-1 text-[11px] font-bold text-warm-gray ring-1 ring-warm-gray/20">
      Nonaktif
    </span>
  );
}

export function ProductTable({
  products,
  totalCount,
  onEdit,
  onRefresh,
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
      product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan"
    );
    onRefresh();
  }

  return (
    <>
      <div className="rounded-[32px] bg-card shadow-soft ring-1 ring-warm-sand/30 overflow-hidden">
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
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-warm-gray font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-cream flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-warm-sand" />
                      </div>
                      <p>Belum ada produk yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="group hover:bg-cream/30 transition-colors"
                  >
                    {/* Product Info */}
                    <td className="py-4 pl-6 lg:pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 lg:h-16 lg:w-16 shrink-0 rounded-2xl bg-warm-sand/50 flex items-center justify-center overflow-hidden ring-1 ring-warm-sand/50">
                          {product.images[0] ? (
                            <Image
                              src={getImageUrl(product.images[0].url)}
                              alt={product.name}
                              fill
                              className="object-cover !relative h-full w-full"
                              sizes="64px"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-warm-gray/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-dark-brown truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-[11px] font-bold text-warm-gray uppercase tracking-wider mt-0.5 truncate max-w-[180px]">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4">
                      <span className="font-bold text-dark-brown">
                        {formatCurrency(product.price)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-4">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <StatusBadge isActive={product.isActive} />
                    </td>

                    {/* Sold Count */}
                    <td className="py-4 text-center">
                      <span className="font-bold text-dark-brown tabular-nums">
                        {product._count.orderItems}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 lg:pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          title="Edit produk"
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-dark-brown hover:bg-terracotta hover:text-white transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setImageDialogProduct(product)}
                          title="Upload gambar"
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-dark-brown hover:bg-terracotta hover:text-white transition-all"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          title={
                            product.isActive ? "Nonaktifkan" : "Aktifkan"
                          }
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-warm-gray hover:bg-dark-brown hover:text-white transition-all"
                        >
                          {product.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-warm-gray font-medium">
              <div className="h-16 w-16 rounded-2xl bg-cream flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-warm-sand" />
              </div>
              <p>Belum ada produk yang ditemukan.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl bg-white p-4 ring-1 ring-warm-sand/30 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="h-20 w-20 shrink-0 rounded-xl bg-warm-sand/50 flex items-center justify-center overflow-hidden ring-1 ring-warm-sand/50 relative">
                      {product.images[0] ? (
                        <Image
                          src={getImageUrl(product.images[0].url)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-warm-gray/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                         <h3 className="font-display font-bold text-dark-brown truncate">
                          {product.name}
                        </h3>
                        <StatusBadge isActive={product.isActive} />
                      </div>
                      <p className="text-[10px] font-bold text-warm-gray uppercase tracking-wider mt-1 truncate">
                        {product.slug}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <StockBadge stock={product.stock} />
                        <span className="text-xs text-warm-gray font-medium px-2 py-0.5 rounded-full bg-cream">
                           {product._count.orderItems} Terjual
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-warm-sand/20 flex items-center justify-between">
                     <span className="font-display font-extrabold text-lg text-dark-brown">
                        {formatCurrency(product.price)}
                      </span>

                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setImageDialogProduct(product)}
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-cream text-warm-gray hover:bg-dark-brown hover:text-white transition-all ring-1 ring-warm-sand/30"
                        >
                          {product.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="bg-cream/30 px-6 lg:px-8 py-4 border-t border-warm-sand/30 flex items-center justify-between text-sm font-bold text-warm-gray">
            <span>
              Menampilkan {products.length} dari {totalCount} produk
            </span>
          </div>
        )}
      </div>

      {/* Image Upload Dialog */}
      <Dialog
        open={!!imageDialogProduct}
        onOpenChange={(v) => !v && setImageDialogProduct(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-dark-brown">
              Upload Gambar &mdash; {imageDialogProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {imageDialogProduct && (
            <div className="space-y-4">
              {imageDialogProduct.images.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {imageDialogProduct.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-warm-sand/50"
                    >
                      <Image
                        src={getImageUrl(img.url)}
                        alt="Product"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
              <ImageUpload
                productId={imageDialogProduct.id}
                onUploaded={() => {
                  setImageDialogProduct(null);
                  onRefresh();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
