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
} from "lucide-react";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductForm } from "@/components/admin/products/product-form";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

      {/* Quick Stats */}
      {!loading && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          <button
            onClick={() => { setStockFilter("all"); setStatusFilter("all"); }}
            className={`group rounded-2xl p-4 ring-1 transition-all text-left ${
              stockFilter === "all" && statusFilter === "all"
                ? "bg-terracotta text-white ring-terracotta/30 shadow-md shadow-terracotta/20"
                : "bg-card ring-warm-sand/30 hover:ring-terracotta/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Total</span>
            </div>
            <p className="font-display font-extrabold text-2xl tabular-nums">{stats.total}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">produk</p>
          </button>

          <button
            onClick={() => { setStockFilter("all"); setStatusFilter("active"); }}
            className={`group rounded-2xl p-4 ring-1 transition-all text-left ${
              statusFilter === "active"
                ? "bg-sage text-white ring-sage/30 shadow-md shadow-sage/20"
                : "bg-card ring-warm-sand/30 hover:ring-sage/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Aktif</span>
            </div>
            <p className="font-display font-extrabold text-2xl tabular-nums">{stats.active}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">ditampilkan di toko</p>
          </button>

          <button
            onClick={() => { setStockFilter("low-stock"); setStatusFilter("all"); }}
            className={`group rounded-2xl p-4 ring-1 transition-all text-left ${
              stockFilter === "low-stock"
                ? "bg-amber-500 text-white ring-amber-400/30 shadow-md shadow-amber-500/20"
                : "bg-card ring-warm-sand/30 hover:ring-amber-400/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Stok Rendah</span>
            </div>
            <p className="font-display font-extrabold text-2xl tabular-nums">{stats.lowStock}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">perlu diisi ulang</p>
          </button>

          <button
            onClick={() => { setStockFilter("out-of-stock"); setStatusFilter("all"); }}
            className={`group rounded-2xl p-4 ring-1 transition-all text-left ${
              stockFilter === "out-of-stock"
                ? "bg-red-500 text-white ring-red-400/30 shadow-md shadow-red-500/20"
                : "bg-card ring-warm-sand/30 hover:ring-red-300/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <PackageX className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Habis</span>
            </div>
            <p className="font-display font-extrabold text-2xl tabular-nums">{stats.outOfStock}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">stok kosong</p>
          </button>
        </div>
      )}

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
            {/* Filters */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-full bg-cream px-5 py-3 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 cursor-pointer transition-all"
            >
              <option value="all">Semua Stok</option>
              <option value="in-stock">Tersedia</option>
              <option value="low-stock">Stok Rendah</option>
              <option value="out-of-stock">Habis</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full bg-cream px-5 py-3 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 cursor-pointer transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center rounded-full bg-cream ring-1 ring-warm-sand/50 p-1 gap-1 self-stretch sm:self-auto">
              <button
                onClick={() => setViewMode("grid")}
                title="Tampilan foto (grid)"
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-terracotta text-white shadow-sm"
                    : "text-warm-gray hover:text-dark-brown"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Foto</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Tampilan daftar"
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-terracotta text-white shadow-sm"
                    : "text-warm-gray hover:text-dark-brown"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Daftar</span>
              </button>
            </div>
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
            viewMode={viewMode}
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