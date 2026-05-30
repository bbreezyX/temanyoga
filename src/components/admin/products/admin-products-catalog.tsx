"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTable } from "@/components/admin/products/product-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminProductListItem,
  AdminProductListResponse,
  Pagination,
} from "@/types/api";
import type { AdminProductCatalogParams as CatalogParams } from "@/lib/admin-products";

const ProductForm = dynamic(
  () =>
    import("@/components/admin/products/product-form").then((m) => ({
      default: m.ProductForm,
    })),
  { ssr: false },
);

function buildCatalogQuery(params: CatalogParams) {
  const nextParams = new URLSearchParams();
  if (params.page > 1) {
    nextParams.set("page", params.page.toString());
  }
  if (params.search) {
    nextParams.set("search", params.search);
  }
  if (params.stock !== "all") {
    nextParams.set("stock", params.stock);
  }
  if (params.status !== "all") {
    nextParams.set("status", params.status);
  }
  return nextParams.toString();
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
    if (typeof lastItem === "number" && pageNumber - lastItem > 1) {
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
          ),
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

interface AdminProductsCatalogProps {
  data: AdminProductListResponse;
  params: CatalogParams;
}

export function AdminProductsCatalog({ data, params }: AdminProductsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(null);
  const [search, setSearch] = useState(params.search);

  function navigateCatalog(next: CatalogParams) {
    const query = buildCatalogQuery(next);
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (search === params.search) {
      return;
    }

    const timeout = setTimeout(() => {
      const query = buildCatalogQuery({
        ...params,
        page: 1,
        search,
      });
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, params, pathname, router]);

  function handleStockChange(value: string) {
    navigateCatalog({ ...params, page: 1, stock: value });
  }

  function handleStatusChange(value: string) {
    navigateCatalog({ ...params, page: 1, status: value });
  }

  function handlePageChange(page: number) {
    navigateCatalog({ ...params, page });
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleEdit(product: AdminProductListItem) {
    setEditProduct(product);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditProduct(null);
  }

  const { products, pagination } = data;

  return (
    <div className="space-y-8">
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

      <div
        className="flex flex-col gap-6 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-3xl bg-card p-4 md:p-5 shadow-soft ring-1 ring-warm-sand/30">
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
            <Select value={params.stock} onValueChange={handleStockChange}>
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

            <Select value={params.status} onValueChange={handleStatusChange}>
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

        <div
          className={`space-y-4 transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
        >
          <div className="flex items-center justify-between min-h-6 px-1">
            <p className="text-xs font-bold text-warm-gray">
              Menampilkan {products.length} dari {pagination.total} produk
            </p>
            {isPending && (
              <p className="text-xs font-bold text-warm-gray">Memperbarui...</p>
            )}
          </div>

          <ProductTable
            products={products}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
            viewMode="grid"
          />

          <AdminPaginationControls
            pagination={pagination}
            loading={isPending}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {formOpen && (
        <ProductForm
          open={formOpen}
          product={editProduct}
          onClose={handleClose}
          onSaved={handleRefresh}
        />
      )}
    </div>
  );
}
