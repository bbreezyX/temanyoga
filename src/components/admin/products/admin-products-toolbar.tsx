"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminProductsViewMode } from "@/components/admin/products/admin-products-table-body";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminProductCatalogParams as CatalogParams } from "@/lib/admin-products";

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

type AdminProductsToolbarProps = {
  params: CatalogParams;
  onNavigate: (next: CatalogParams) => void;
  viewMode: AdminProductsViewMode;
  onViewModeChange: (mode: AdminProductsViewMode) => void;
};

export function AdminProductsToolbar({
  params,
  onNavigate,
  viewMode,
  onViewModeChange,
}: AdminProductsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(params.search);

  useEffect(() => {
    setSearch(params.search);
  }, [params.search]);

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-3 ring-1 ring-warm-sand/30 sm:rounded-3xl sm:p-4 md:p-5">
      <div className="flex w-full min-w-0 items-center gap-3 rounded-full bg-cream px-4 py-2.5 ring-1 ring-warm-sand/50 focus-within:ring-2 focus-within:ring-terracotta/40 sm:px-5 sm:py-3">
        <Search className="h-5 w-5 shrink-0 text-warm-gray" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-w-0 bg-transparent text-sm font-medium text-dark-brown outline-none placeholder:text-warm-gray/60"
        />
      </div>

      <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center">
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:flex-1">
        <Select
          value={params.stock}
          onValueChange={(value) => onNavigate({ ...params, page: 1, stock: value })}
        >
          <SelectTrigger className="h-11 w-full rounded-2xl border-none bg-cream px-5 text-sm font-bold text-dark-brown shadow-none ring-1 ring-warm-sand/50">
            <SelectValue placeholder="Status Stok" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-warm-sand/20 bg-white p-1 shadow-xl">
            <SelectItem value="all">Semua Stok</SelectItem>
            <SelectItem value="in-stock">Tersedia</SelectItem>
            <SelectItem value="low-stock">Stok Rendah</SelectItem>
            <SelectItem value="out-of-stock">Habis</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.status}
          onValueChange={(value) =>
            onNavigate({ ...params, page: 1, status: value })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-2xl border-none bg-cream px-5 text-sm font-bold text-dark-brown shadow-none ring-1 ring-warm-sand/50">
            <SelectValue placeholder="Status Produk" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-warm-sand/20 bg-white p-1 shadow-xl">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        </div>

        <div
          className="flex shrink-0 items-center justify-center gap-1 self-center rounded-2xl bg-cream p-1 ring-1 ring-warm-sand/50 min-[480px]:self-auto"
          role="group"
          aria-label="Tampilan produk"
        >
          <button
            type="button"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              viewMode === "grid"
                ? "bg-terracotta text-white shadow-sm"
                : "text-warm-gray hover:bg-warm-sand/40 hover:text-dark-brown",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Tampilan kartu</span>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              viewMode === "list"
                ? "bg-terracotta text-white shadow-sm"
                : "text-warm-gray hover:bg-warm-sand/40 hover:text-dark-brown",
            )}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Tampilan daftar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
