"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductForm } from "@/components/admin/products/product-form";
import { apiFetch } from "@/lib/api-client";
import type { AdminProductListItem, AdminProductListResponse } from "@/types/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(
    null
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminProductListResponse>(
      "/api/admin/products?limit=100"
    );
    if (res.success) {
      setProducts(res.data.products);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleEdit(product: AdminProductListItem) {
    setEditProduct(product);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditProduct(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onRefresh={fetchProducts}
        />
      )}

      <ProductForm
        open={formOpen}
        product={editProduct}
        onClose={handleClose}
        onSaved={fetchProducts}
      />
    </div>
  );
}
