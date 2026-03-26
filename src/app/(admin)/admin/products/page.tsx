"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PlusCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductForm } from "@/components/admin/products/product-form";
import { Button } from "@/components/ui/button";
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
  Pagination,
} from "@/types/api";

const PRODUCTS_PER_PAGE = 20;

function parseCatalogParams(searchString: string) {
  const params = new URLSearchParams(searchString);
  const pageValue = Number(params.get("page"));

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    search: params.get("search") ?? "",
    stock: params.get("stock") ?? "all",
    status: params.get("status") ?? "all",
  };
}

function AdminPaginationControls({
  pagination,
  loading,
  onPageChange,
}: {
  pagination: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.filter((pageNumber) => {
    if (totalPages <= 7) {
      return true;
    }

    return (
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1
    );
  });

  const pageItems: Array<number | "ellipsis"> = [];
  for (const pageNumber of visiblePages) {
    const lastItem = pageItems[pageItems.length - 1];
    if (
      typeof lastItem === "number" &&
      pageNumber - lastItem > 1
    ) {
      pageItems.push("ellipsis");
    }
    pageItems.push(pageNumber);
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <div className="flex items-center gap-1.5 rounded-full bg-card px-2 py-2 shadow-soft ring-1 ring-warm-sand/30">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          className="rounded-full border-warm-sand/40 bg-cream text-dark-brown hover:bg-cream"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm font-bold text-warm-gray"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(item)}
              disabled={loading}
              className={
                item === page
                  ? "min-w-10 rounded-full bg-terracotta px-3 text-white hover:bg-terracotta"
                  : "min-w-10 rounded-full border-warm-sand/40 bg-white px-3 text-dark-brown hover:bg-cream"
              }
            >
              {item}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          className="rounded-full border-warm-sand/40 bg-cream text-dark-brown hover:bg-cream"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs font-bold text-warm-gray">
        Halaman {page} dari {totalPages}
      </p>
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const initialCatalogParams = parseCatalogParams(
    typeof window === "undefined" ? "" : window.location.search
  );
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(
    null
  );
  const [search, setSearch] = useState(initialCatalogParams.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialCatalogParams.search);
  const [stockFilter, setStockFilter] = useState(initialCatalogParams.stock);
  const [statusFilter, setStatusFilter] = useState(initialCatalogParams.status);
  const [currentPage, setCurrentPage] = useState(initialCatalogParams.page);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const syncFromUrl = () => {
      const nextCatalogParams = parseCatalogParams(window.location.search);

      setSearch(nextCatalogParams.search);
      setDebouncedSearch(nextCatalogParams.search);
      setStockFilter(nextCatalogParams.stock);
      setStatusFilter(nextCatalogParams.status);
      setCurrentPage(nextCatalogParams.page);
    };

    const syncTimer = window.setTimeout(syncFromUrl, 0);
    window.addEventListener("popstate", syncFromUrl);

    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextParams = new URLSearchParams();
    if (currentPage > 1) {
      nextParams.set("page", currentPage.toString());
    }
    if (debouncedSearch) {
      nextParams.set("search", debouncedSearch);
    }
    if (stockFilter !== "all") {
      nextParams.set("stock", stockFilter);
    }
    if (statusFilter !== "all") {
      nextParams.set("status", statusFilter);
    }

    const nextQuery = nextParams.toString();
    const currentQuery = window.location.search.startsWith("?")
      ? window.location.search.slice(1)
      : window.location.search;
    if (nextQuery === currentQuery) {
      return;
    }

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [currentPage, debouncedSearch, stockFilter, statusFilter, pathname, router]);

  const fetchProducts = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", PRODUCTS_PER_PAGE.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (statusFilter !== "all") {
      params.set("isActive", statusFilter === "active" ? "true" : "false");
    }
    if (stockFilter !== "all") {
      params.set("stock", stockFilter);
    }

    const res = await apiFetch<AdminProductListResponse>(
      `/api/admin/products?${params.toString()}`
    );

    if (res.success) {
      if (
        res.data.pagination.totalPages > 0 &&
        currentPage > res.data.pagination.totalPages
      ) {
        setCurrentPage(res.data.pagination.totalPages);
        return;
      }

      setProducts(res.data.products);
      setPagination(res.data.pagination);
    }

    hasLoadedOnceRef.current = true;
    setLoading(false);
    setIsRefreshing(false);
  }, [currentPage, debouncedSearch, statusFilter, stockFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 0);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const stats = useMemo(() => ({
    total: pagination.total,
    active: products.filter((p) => p.isActive).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock !== null && p.stock > 0 && p.stock <= 10).length,
  }), [pagination.total, products]);

  void stats;

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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm font-medium text-dark-brown placeholder:text-warm-gray/60 outline-none min-w-0"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Custom Filters */}
            <Select
              value={stockFilter}
              onValueChange={(value) => {
                setStockFilter(value);
                setCurrentPage(1);
              }}
            >
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

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
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
          <div className="space-y-4">
            <div className="flex items-center justify-between min-h-6 px-1">
              <p className="text-xs font-bold text-warm-gray">
                Menampilkan {products.length} dari {pagination.total} produk
              </p>
              {isRefreshing && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-warm-gray">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-terracotta" />
                  Memperbarui katalog...
                </div>
              )}
            </div>

            <ProductTable
              products={products}
              onEdit={handleEdit}
              onRefresh={fetchProducts}
              viewMode="grid"
            />

            <AdminPaginationControls
              pagination={pagination}
              loading={isRefreshing}
              onPageChange={setCurrentPage}
            />
          </div>
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