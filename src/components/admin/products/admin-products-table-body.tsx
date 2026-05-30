"use client";

import { memo } from "react";
import { ProductTable } from "@/components/admin/products/product-table";
import type { AdminProductListItem } from "@/types/api";

export type AdminProductsViewMode = "grid" | "list";

type AdminProductsTableBodyProps = {
  products: AdminProductListItem[];
  viewMode: AdminProductsViewMode;
  onEdit: (product: AdminProductListItem) => void;
  onRefresh: () => void;
};

export const AdminProductsTableBody = memo(function AdminProductsTableBody({
  products,
  viewMode,
  onEdit,
  onRefresh,
}: AdminProductsTableBodyProps) {
  return (
    <ProductTable
      products={products}
      onEdit={onEdit}
      onRefresh={onRefresh}
      viewMode={viewMode}
    />
  );
});
