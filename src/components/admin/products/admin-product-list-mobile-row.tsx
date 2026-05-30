"use client";

import {
  Pencil,
  ImagePlus,
  EyeOff,
  Eye,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { AdminProductThumbnail } from "@/components/admin/products/admin-product-thumbnail";
import type { AdminProductListItem } from "@/types/api";

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-600/20">
        Unlimited
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-red-600/20">
        Habis
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-600/20">
        Rendah ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-sage ring-1 ring-sage/20">
      Tersedia ({stock})
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${
        isActive ? "text-sage ring-sage/25" : "text-warm-gray ring-warm-sand/50"
      }`}
    >
      {isActive ? "Publish" : "Draft"}
    </span>
  );
}

const actionBtn =
  "flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors ring-1 disabled:cursor-not-allowed disabled:opacity-50";

type AdminProductListMobileRowProps = {
  product: AdminProductListItem;
  isDeleting: boolean;
  deleteHelperText: string;
  onEdit: (product: AdminProductListItem) => void;
  onManageImages: (product: AdminProductListItem) => void;
  onToggleActive: (product: AdminProductListItem) => void;
  onDelete: (product: AdminProductListItem) => void;
};

export function AdminProductListMobileRow({
  product,
  isDeleting,
  deleteHelperText,
  onEdit,
  onManageImages,
  onToggleActive,
  onDelete,
}: AdminProductListMobileRowProps) {
  const image = product.images[0];
  const canDelete = product._count.orderItems === 0;

  return (
    <article className="p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-warm-sand/50 ring-1 ring-warm-sand/50 sm:h-20 sm:w-20">
          {image ? (
            <AdminProductThumbnail storageUrl={image.url} alt={product.name} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-7 w-7 text-warm-gray/40" />
            </div>
          )}
          {product.images.length > 1 && (
            <span className="absolute bottom-1 right-1 rounded-full bg-dark-brown/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
              +{product.images.length - 1}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-sm font-bold leading-snug text-dark-brown line-clamp-2 sm:text-base">
              {product.name}
            </h3>
            <StatusBadge isActive={product.isActive} />
          </div>
          {product.description ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] text-warm-gray sm:text-xs">
              {product.description}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StockBadge stock={product.stock} />
            <span className="text-[10px] font-bold text-warm-gray">
              {product._count.orderItems} terjual
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-3 border-t border-warm-sand/25 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-extrabold text-dark-brown sm:text-xl">
            {formatCurrency(product.price)}
          </span>
        </div>

        {product._count.orderItems > 0 && (
          <p className="text-[11px] font-semibold leading-relaxed text-amber-700">
            {deleteHelperText}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
          <button
            type="button"
            onClick={() => onEdit(product)}
            disabled={isDeleting}
            className={`${actionBtn} bg-cream text-dark-brown ring-warm-sand/30 hover:bg-terracotta hover:text-white`}
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onManageImages(product)}
            disabled={isDeleting}
            className={`${actionBtn} bg-cream text-dark-brown ring-warm-sand/30 hover:bg-terracotta hover:text-white`}
          >
            <ImagePlus className="h-3.5 w-3.5 shrink-0" />
            Foto
            {product.images.length > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta/15 px-1 text-[10px] font-black text-terracotta">
                {product.images.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(product)}
            disabled={isDeleting}
            className={`${actionBtn} col-span-2 min-[420px]:col-span-1 ${
              product.isActive
                ? "bg-sage/10 text-sage ring-sage/20"
                : "bg-cream text-warm-gray ring-warm-sand/30"
            }`}
          >
            {product.isActive ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">
              {product.isActive ? "Nonaktifkan" : "Aktifkan"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            disabled={isDeleting || !canDelete}
            title={deleteHelperText}
            className={`${actionBtn} col-span-2 min-[420px]:col-span-1 bg-red-50 text-red-600 ring-red-200 hover:bg-red-100`}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </article>
  );
}
