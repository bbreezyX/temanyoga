"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ListOrdered,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import { Button } from "@/components/ui/button";
import type { AdminOrderListResponse, Pagination } from "@/types/api";
import {
  ADMIN_ORDERS_PER_PAGE,
  type AdminOrderCatalogParams,
} from "@/lib/admin-orders";

function buildCatalogQuery(params: AdminOrderCatalogParams) {
  const nextParams = new URLSearchParams();
  if (params.page > 1) {
    nextParams.set("page", params.page.toString());
  }
  if (params.limit !== ADMIN_ORDERS_PER_PAGE) {
    nextParams.set("limit", params.limit.toString());
  }
  if (params.search) {
    nextParams.set("search", params.search);
  }
  if (params.status !== "all") {
    nextParams.set("status", params.status);
  }
  if (params.dateFrom) {
    nextParams.set("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    nextParams.set("dateTo", params.dateTo);
  }
  return nextParams.toString();
}

function StatsCard({
  icon,
  label,
  value,
  bgIcon,
  ringIcon,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgIcon: string;
  ringIcon: string;
}) {
  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-warm-sand/30 transition-transform hover:-translate-y-1 duration-300">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${bgIcon} ring-1 ${ringIcon}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
            {label}
          </p>
          <p className="font-display text-3xl font-extrabold text-dark-brown">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
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

  return (
    <div className="bg-cream/30 p-4 md:p-6 border-t border-warm-sand/30 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-8 text-sm font-bold text-warm-gray">
      <span>
        Halaman {page} dari {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          className="h-10 w-10 rounded-full bg-white ring-1 ring-warm-sand/50 text-dark-brown hover:bg-terracotta hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          className="h-10 w-10 rounded-full bg-white ring-1 ring-warm-sand/50 text-dark-brown hover:bg-terracotta hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

interface AdminOrdersCatalogProps {
  data: AdminOrderListResponse;
  params: AdminOrderCatalogParams;
}

export function AdminOrdersCatalog({ data, params }: AdminOrdersCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.search);

  const { orders, pagination, orderStats } = data;

  function navigateCatalog(next: AdminOrderCatalogParams) {
    const query = buildCatalogQuery(next);
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
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

  function handleStatusChange(value: string) {
    navigateCatalog({ ...params, page: 1, status: value });
  }

  function handlePageChange(page: number) {
    navigateCatalog({ ...params, page });
  }

  const stats = [
    {
      label: "Total Pesanan",
      value: orderStats.totalOrders.toString(),
      icon: <ListOrdered className="h-6 w-6 text-dark-brown" />,
      bgIcon: "bg-dark-brown/5",
      ringIcon: "ring-dark-brown/10",
    },
    {
      label: "Pembayaran Tertunda",
      value: orderStats.pendingPayment.toString(),
      icon: <CreditCard className="h-6 w-6 text-amber-600" />,
      bgIcon: "bg-amber-50",
      ringIcon: "ring-amber-600/20",
    },
    {
      label: "Diproses",
      value: orderStats.processing.toString(),
      icon: <RefreshCw className="h-6 w-6 text-blue-600" />,
      bgIcon: "bg-blue-50",
      ringIcon: "ring-blue-600/20",
    },
    {
      label: "Selesai",
      value: orderStats.completed.toString(),
      icon: <CheckCircle2 className="h-6 w-6 text-sage" />,
      bgIcon: "bg-sage/10",
      ringIcon: "ring-sage/20",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-dark-brown tracking-tight">
          Manajemen Pesanan
        </h1>
        <p className="mt-2 text-warm-gray font-medium">
          Lacak dan penuhi pesanan pelanggan, verifikasi pembayaran, dan kelola
          pengiriman.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up [animation-delay:100ms]">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div
        className={`rounded-[40px] bg-white shadow-soft ring-1 ring-warm-sand/30 overflow-hidden animate-fade-in-up [animation-delay:200ms] transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
      >
        <OrderFilters
          search={search}
          onSearchChange={setSearch}
          status={params.status}
          onStatusChange={handleStatusChange}
        />

        <div className="px-4 md:px-8 py-3 border-b border-warm-sand/20 bg-cream/20">
          <p className="text-xs font-bold text-warm-gray">
            Menampilkan {orders.length} dari {pagination.total} pesanan
            {isPending ? " · Memperbarui..." : ""}
          </p>
        </div>

        <OrderTable orders={orders} />

        <AdminPaginationControls
          pagination={pagination}
          loading={isPending}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
