"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PlusCircle,
  Loader2,
  Search,
  LayoutGrid,
  List,
  Package,
  PackageCheck,
  PackageX,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductForm } from "@/components/admin/products/product-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import type {
  AdminProductListItem,
  AdminProductListResponse,
} from "@/types/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (statusFilter !== "all") {
      params.set("isActive", statusFilter === "active" ? "true" : "false");
    }

    const res = await apiFetch<AdminProductListResponse>(
      `/api/admin/products?${params.toString()}`
    );
    if (res.success) {
      setProducts(res.data.products);
    }
    setLoading(false);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 0);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" &&
          (p.stock === null || p.stock > 10)) ||
        (stockFilter === "low-stock" &&
          p.stock !== null &&
          p.stock > 0 &&
          p.stock <= 10) ||
        (stockFilter === "out-of-stock" && p.stock !== null && p.stock === 0);

      return matchStock;
    });
  }, [products, stockFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock !== null && p.stock > 0 && p.stock <= 10).length,
  }), [products]);

  function handleEdit(product: AdminProductListItem) {
    setEditProduct(product);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditProduct(null);
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-dark-brown tracking-tight">
            Katalog Produk
          </h1>
          <p className="mt-2 text-warm-gray font-medium">
            Kelola inventaris, harga, dan produk toko Anda.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center justify-center gap-2.5 rounded-full bg-terracotta px-7 py-3.5 text-white font-bold shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30 hover:scale-[1.03] transition-all active:scale-[0.98] w-full sm:w-auto shrink-0"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Search, Filters & View Toggle */}
      <div
        className="flex flex-col gap-6 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-3xl bg-card p-4 md:p-5 shadow-soft ring-1 ring-warm-sand/30">
          {/* Search */}
          <div className="flex w-full md:flex-1 md:min-w-[240px] items-center gap-3 rounded-full bg-cream px-5 py-3 ring-1 ring-warm-sand/50 focus-within:ring-2 focus-within:ring-terracotta/40 transition-all">
            <Search className="h-5 w-5 text-warm-gray shrink-0" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-dark-brown placeholder:text-warm-gray/60 outline-none min-w-0"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Custom Filters */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-2xl bg-cream px-5 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/50 hover:ring-terracotta/40 focus:ring-2 focus:ring-terracotta/40 transition-all border-none shadow-none [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                <SelectValue placeholder="Status Stok" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-warm-sand/20 bg-white/95 backdrop-blur-md shadow-xl p-1 overflow-hidden">
                <SelectItem value="all" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Semua Stok
                </SelectItem>
                <SelectItem value="in-stock" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Tersedia
                </SelectItem>
                <SelectItem value="low-stock" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Stok Rendah
                </SelectItem>
                <SelectItem value="out-of-stock" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Habis
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-11 rounded-2xl bg-cream px-5 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/50 hover:ring-terracotta/40 focus:ring-2 focus:ring-terracotta/40 transition-all border-none shadow-none [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                <SelectValue placeholder="Status Produk" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-warm-sand/20 bg-white/95 backdrop-blur-md shadow-xl p-1 overflow-hidden">
                <SelectItem value="all" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Semua Status
                </SelectItem>
                <SelectItem value="active" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Aktif
                </SelectItem>
                <SelectItem value="inactive" className="rounded-xl font-medium focus:bg-cream focus:text-terracotta py-2.5 transition-colors">
                  Nonaktif
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table or Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            <span className="text-sm font-medium text-warm-gray">
              Memuat produk...
            </span>
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            totalCount={products.length}
            onEdit={handleEdit}
            onRefresh={fetchProducts}
            viewMode="grid"
          />
        )}
      </div>

      <ProductForm
        open={formOpen}
        product={editProduct}
        onClose={handleClose}
        onSaved={fetchProducts}
      />
    </div>
  );
}