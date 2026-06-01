"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Pencil,
  ImagePlus,
  EyeOff,
  Eye,
  ImageIcon,
  Trash2,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { AdminProductGrid } from "@/components/admin/products/admin-product-grid";
import type { AdminProductGridCardActions } from "@/components/admin/products/admin-product-grid-card";
import { AdminProductListMobileRow } from "@/components/admin/products/admin-product-list-mobile-row";
import { AdminProductThumbnail } from "@/components/admin/products/admin-product-thumbnail";
import { apiPatch, apiDelete } from "@/lib/api-client";
import { ImageUpload } from "./image-upload";
import type { AdminProductListItem } from "@/types/api";

interface ProductTableProps {
  products: AdminProductListItem[];
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
  return (
    <span
      className={`inline-flex select-none items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm ring-1 ${
        isActive ? "text-sage ring-sage/25" : "text-warm-gray ring-warm-sand/50"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-sage" : "bg-warm-gray"}`}
      />
      {isActive ? "Publish" : "Draft"}
    </span>
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
  onEdit,
  onRefresh,
  viewMode = "grid",
}: ProductTableProps) {
  const toast = useToast();
  const [imageDialogProduct, setImageDialogProduct] =
    useState<AdminProductListItem | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deleteDialogProduct, setDeleteDialogProduct] =
    useState<AdminProductListItem | null>(null);

  const toggleActive = useCallback(
    async (product: AdminProductListItem) => {
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
    },
    [onRefresh, toast],
  );

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

  async function handleDeleteProduct(product: AdminProductListItem) {
    setDeletingProductId(product.id);
    const res = await apiDelete<{ message: string }>(`/api/admin/products/${product.id}`);
    setDeletingProductId(null);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    if (imageDialogProduct?.id === product.id) {
      setImageDialogProduct(null);
    }

    if (deleteDialogProduct?.id === product.id) {
      setDeleteDialogProduct(null);
    }

    toast.success("Produk berhasil dihapus");
    onRefresh();
  }

  const openDeleteDialog = useCallback((product: AdminProductListItem) => {
    if (product._count.orderItems > 0) {
      return;
    }

    setDeleteDialogProduct(product);
  }, []);

  function getDeleteHelperText(product: AdminProductListItem) {
    if (product._count.orderItems > 0) {
      return "Tidak bisa dihapus karena produk ini sudah punya riwayat penjualan.";
    }

    return "Hapus permanen hanya untuk produk yang belum pernah terjual.";
  }

  const gridActions = useMemo<AdminProductGridCardActions>(
    () => ({
      onEdit,
      onManageImages: setImageDialogProduct,
      onToggleActive: toggleActive,
      onDelete: openDeleteDialog,
    }),
    [onEdit, toggleActive, openDeleteDialog],
  );

  return (
    <>
      {viewMode === "grid" && (
        <AdminProductGrid
          products={products}
          deletingProductId={deletingProductId}
          actions={gridActions}
        />
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────── */}
      {viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-warm-sand/30 sm:rounded-[32px] sm:shadow-soft">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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
                      (() => {
                        const isDeleting = deletingProductId === product.id;
                        return (
                      <tr
                        key={product.id}
                        className="group hover:bg-cream/30 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_88px]"
                      >
                        <td className="py-4 pl-6 lg:pl-8">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 rounded-2xl bg-warm-sand/50 flex items-center justify-center overflow-hidden ring-1 ring-warm-sand/50 relative">
                              {product.images[0] ? (
                                <AdminProductThumbnail
                                  storageUrl={product.images[0].url}
                                  alt={product.name}
                                  size="list"
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
                          <div className="flex flex-col items-end gap-2">
                            {product._count.orderItems > 0 && (
                              <div className="max-w-[240px] text-right text-[11px] font-semibold leading-relaxed text-amber-700">
                                {getDeleteHelperText(product)}
                              </div>
                            )}
                            <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(product)}
                              disabled={isDeleting}
                              className="flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold text-dark-brown hover:bg-terracotta hover:text-white transition-all ring-1 ring-warm-sand/30"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setImageDialogProduct(product)}
                              disabled={isDeleting}
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
                              disabled={isDeleting}
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
                            <button
                              onClick={() => openDeleteDialog(product)}
                              disabled={isDeleting || product._count.orderItems > 0}
                              title={getDeleteHelperText(product)}
                              className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition-all ring-1 ring-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isDeleting ? "Menghapus..." : "Hapus"}
                            </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                        );
                      })()
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-warm-sand/20 lg:hidden">
                {products.map((product) => (
                  <AdminProductListMobileRow
                    key={product.id}
                    product={product}
                    isDeleting={deletingProductId === product.id}
                    deleteHelperText={getDeleteHelperText(product)}
                    onEdit={onEdit}
                    onManageImages={setImageDialogProduct}
                    onToggleActive={toggleActive}
                    onDelete={openDeleteDialog}
                  />
                ))}
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
                        <AdminProductThumbnail
                          storageUrl={img.url}
                          alt={`Foto ${idx + 1}`}
                          size="dialog"
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
                <p className="text-[11px] text-warm-gray">Format: JPG, PNG, WebP, HEIC. File HEIC akan dikonversi otomatis. Maksimal 5 MB per foto.</p>
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

      <Dialog
        open={!!deleteDialogProduct}
        onOpenChange={(open) => {
          if (!open && !deletingProductId) {
            setDeleteDialogProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border-none bg-white p-0 overflow-hidden">
          <div className="bg-red-50 px-6 py-5 border-b border-red-100">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogHeader>
                  <DialogTitle className="font-display text-lg font-black text-dark-brown">
                    Hapus Produk Permanen
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm font-medium text-warm-gray">
                  Produk akan dihapus dari katalog bersama seluruh fotonya.
                </p>
              </div>
            </div>
          </div>

          {deleteDialogProduct && (
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl bg-cream/70 p-4 ring-1 ring-warm-sand/30">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-warm-gray/70">
                  Produk yang dipilih
                </p>
                <p className="mt-2 font-display text-lg font-bold text-dark-brown">
                  {deleteDialogProduct.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-warm-gray">
                  {formatCurrency(deleteDialogProduct.price)}
                </p>
              </div>

              <div className="space-y-2 text-sm font-medium text-warm-gray">
                <p>Tindakan ini tidak bisa dibatalkan.</p>
                <p>Gunakan hapus permanen hanya untuk produk yang belum pernah terjual.</p>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteDialogProduct(null)}
                  disabled={deletingProductId === deleteDialogProduct.id}
                  className="inline-flex items-center justify-center rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/30 transition-all hover:bg-warm-sand/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(deleteDialogProduct)}
                  disabled={deletingProductId === deleteDialogProduct.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingProductId === deleteDialogProduct.id ? "Menghapus produk..." : "Ya, Hapus Permanen"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
