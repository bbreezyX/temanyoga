"use client";

import { useCallback, useEffect, useState, useTransition, memo } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminProductsToolbar } from "@/components/admin/products/admin-products-toolbar";
import {
  AdminProductsTableBody,
  type AdminProductsViewMode,
} from "@/components/admin/products/admin-products-table-body";
import { Button } from "@/components/ui/button";
import type {
  AdminProductListItem,
  AdminProductListResponse,
  Pagination,
} from "@/types/api";
import type { AdminProductCatalogParams as CatalogParams } from "@/lib/admin-products";

const PRODUCT_VIEW_STORAGE_KEY = "temanyoga_admin_products_view";

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
      <div className="w-full max-w-full overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto flex w-max min-w-0 items-center gap-1.5 rounded-full bg-card px-2 py-2 ring-1 ring-warm-sand/30">
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
                className="px-1.5 text-sm font-bold text-warm-gray sm:px-2"
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
                    ? "min-w-9 rounded-full bg-terracotta px-2.5 text-white hover:bg-terracotta sm:min-w-10 sm:px-3"
                    : "min-w-9 rounded-full border-warm-sand/40 bg-white px-2.5 text-dark-brown hover:bg-cream sm:min-w-10 sm:px-3"
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
      </div>

      <p className="text-xs font-bold text-warm-gray">
        Halaman {page} dari {totalPages}
      </p>
    </div>
  );
}

const AdminProductsResults = memo(function AdminProductsResults({
  products,
  pagination,
  viewMode,
  isPending,
  onEdit,
  onRefresh,
  onPageChange,
}: {
  products: AdminProductListItem[];
  pagination: Pagination;
  viewMode: AdminProductsViewMode;
  isPending: boolean;
  onEdit: (product: AdminProductListItem) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-1 px-0.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
        <p className="text-xs font-bold text-warm-gray">
          Menampilkan {products.length} dari {pagination.total} produk
        </p>
        {isPending && (
          <p className="text-xs font-bold text-terracotta">Memperbarui...</p>
        )}
      </div>

      <AdminProductsTableBody
        products={products}
        viewMode={viewMode}
        onEdit={onEdit}
        onRefresh={onRefresh}
      />

      <AdminPaginationControls
        pagination={pagination}
        loading={isPending}
        onPageChange={onPageChange}
      />
    </div>
  );
});

interface AdminProductsCatalogProps {
  data: AdminProductListResponse;
  params: CatalogParams;
}

export function AdminProductsCatalog({ data, params }: AdminProductsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<AdminProductsViewMode>("grid");

  useEffect(() => {
    const stored = localStorage.getItem(PRODUCT_VIEW_STORAGE_KEY);
    if (stored === "grid" || stored === "list") {
      setViewMode(stored);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: AdminProductsViewMode) => {
    setViewMode(mode);
    localStorage.setItem(PRODUCT_VIEW_STORAGE_KEY, mode);
  }, []);

  const navigateCatalog = useCallback(
    (next: CatalogParams) => {
      const query = buildCatalogQuery(next);
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      navigateCatalog({ ...params, page });
    },
    [navigateCatalog, params],
  );

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleEdit = useCallback((product: AdminProductListItem) => {
    setEditProduct(product);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditProduct(null);
  }, []);

  const { products, pagination } = data;

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-dark-brown sm:text-3xl lg:text-4xl">
            Katalog Produk
          </h1>
          <p className="mt-1.5 text-sm font-medium text-warm-gray sm:mt-2">
            Kelola inventaris, harga, dan produk toko Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-terracotta px-6 py-3 font-bold text-white shadow-lg shadow-terracotta/20 hover:bg-terracotta/90 sm:w-auto sm:px-7 sm:py-3.5"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        <AdminProductsToolbar
          params={params}
          onNavigate={navigateCatalog}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        <AdminProductsResults
          products={products}
          pagination={pagination}
          viewMode={viewMode}
          isPending={isPending}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
          onPageChange={handlePageChange}
        />
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
