"use client";

import { memo } from "react";
import {
  Pencil,
  ImagePlus,
  EyeOff,
  Eye,
  ImageIcon,
  Trash2,
  Camera,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { AdminProductThumbnail } from "@/components/admin/products/admin-product-thumbnail";
import type { AdminProductListItem } from "@/types/api";

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-600/20">
        Unlimited
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-red-600/20">
        Habis
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-600/20">
        <span className="truncate">Rendah ({stock})</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-2.5 py-0.5 text-[10px] font-bold text-sage ring-1 ring-sage/20">
      Tersedia ({stock})
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ${
        isActive ? "text-sage ring-sage/25" : "text-warm-gray ring-warm-sand/50"
      }`}
    >
      {isActive ? "Publish" : "Draft"}
    </span>
  );
}

const iconBtn =
  "inline-flex h-10 w-full items-center justify-center rounded-full bg-cream text-dark-brown ring-1 ring-warm-sand/40 hover:bg-warm-sand/50 disabled:cursor-not-allowed disabled:opacity-50";

export type AdminProductGridCardActions = {
  onEdit: (product: AdminProductListItem) => void;
  onManageImages: (product: AdminProductListItem) => void;
  onToggleActive: (product: AdminProductListItem) => void;
  onDelete: (product: AdminProductListItem) => void;
};

type AdminProductGridCardProps = {
  product: AdminProductListItem;
  isDeleting: boolean;
  actions: AdminProductGridCardActions;
};

export const AdminProductGridCard = memo(function AdminProductGridCard({
  product,
  isDeleting,
  actions,
}: AdminProductGridCardProps) {
  const image = product.images[0];
  const canDelete = product._count.orderItems === 0;

  return (
    <article
      className={`flex min-w-0 flex-col rounded-2xl bg-card p-2.5 ring-1 ring-warm-sand/40 sm:rounded-[28px] sm:p-3 [content-visibility:auto] [contain-intrinsic-size:auto_300px] [contain:paint] ${
        product.isActive ? "" : "opacity-65"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream sm:aspect-square sm:rounded-[20px]">
        {image ? (
          <AdminProductThumbnail storageUrl={image.url} alt={product.name} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-warm-gray/40">
            <ImageIcon className="h-10 w-10" />
            <span className="text-[11px] font-medium">Belum ada foto</span>
          </div>
        )}
        <div className="absolute left-2 top-2 z-10 sm:left-2.5 sm:top-2.5">
          <StatusBadge isActive={product.isActive} />
        </div>
        {product.images.length > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-dark-brown/70 px-2 py-0.5 text-[11px] font-bold text-white">
            <Camera className="h-3 w-3" />
            {product.images.length}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-0.5 pt-2.5 sm:gap-2 sm:px-1 sm:pt-3">
        <h3
          title={product.name}
          className="font-display text-sm font-bold leading-snug text-dark-brown line-clamp-2 min-[400px]:line-clamp-1"
        >
          {product.name}
        </h3>
        <span className="font-display text-sm font-extrabold text-dark-brown sm:text-base">
          {formatCurrency(product.price)}
        </span>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <StockBadge stock={product.stock} />
          <span className="text-[10px] font-semibold text-warm-gray sm:text-[11px]">
            {product._count.orderItems} terjual
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-2 border-t border-warm-sand/30 pt-2.5 sm:mt-3 sm:pt-3">
        <button
          type="button"
          onClick={() => actions.onEdit(product)}
          disabled={isDeleting}
          className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-cream px-3 py-2 text-xs font-bold text-dark-brown ring-1 ring-warm-sand/40 hover:bg-terracotta hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" />
          Edit
        </button>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => actions.onManageImages(product)}
            disabled={isDeleting}
            aria-label="Kelola foto"
            className={iconBtn}
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => actions.onToggleActive(product)}
            disabled={isDeleting}
            aria-label={product.isActive ? "Nonaktifkan" : "Aktifkan"}
            className={iconBtn}
          >
            {product.isActive ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => actions.onDelete(product)}
            disabled={isDeleting || !canDelete}
            aria-label="Hapus permanen"
            title={
              canDelete
                ? "Hapus permanen"
                : "Sudah terjual — tidak bisa dihapus"
            }
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
});
