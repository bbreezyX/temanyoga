"use client";

import { memo } from "react";
import { ImageIcon } from "lucide-react";
import {
  AdminProductGridCard,
  type AdminProductGridCardActions,
} from "@/components/admin/products/admin-product-grid-card";
import type { AdminProductListItem } from "@/types/api";

type AdminProductGridProps = {
  products: AdminProductListItem[];
  deletingProductId: string | null;
  actions: AdminProductGridCardActions;
};

export const AdminProductGrid = memo(function AdminProductGrid({
  products,
  deletingProductId,
  actions,
}: AdminProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-warm-gray">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cream">
          <ImageIcon className="h-10 w-10 text-warm-sand" />
        </div>
        <div className="text-center">
          <p className="font-bold text-dark-brown">Belum ada produk</p>
          <p className="mt-1 text-sm">
            Tambah produk pertamamu dengan tombol di atas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <AdminProductGridCard
          key={product.id}
          product={product}
          isDeleting={deletingProductId === product.id}
          actions={actions}
        />
      ))}
    </div>
  );
});
