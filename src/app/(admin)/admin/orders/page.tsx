"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import { apiFetch } from "@/lib/api-client";
import type { AdminOrderListItem, AdminOrderListResponse } from "@/types/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    processing: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const res = await apiFetch<AdminOrderListResponse>(
      `/api/admin/orders?${params}`,
    );
    if (res.success) {
      setOrders(res.data.orders);
      if (res.data.orderStats) {
        setStats(res.data.orderStats);
      }
    }
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timeout);
  }, [fetchOrders]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-dark-brown tracking-tight">
          Manajemen Pesanan
        </h1>
        <p className="mt-2 text-warm-gray font-medium">
          Lacak dan penuhi pesanan pelanggan, verifikasi pembayaran, dan kelola
          pengiriman.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up [animation-delay:100ms]">
        <StatsCard
          icon={<ListOrdered className="h-6 w-6 text-dark-brown" />}
          label="Total Pesanan"
          value={stats.totalOrders.toString()}
          bgIcon="bg-dark-brown/5"
          ringIcon="ring-dark-brown/10"
        />
        <StatsCard
          icon={<CreditCard className="h-6 w-6 text-amber-600" />}
          label="Pembayaran Tertunda"
          value={stats.pendingPayment.toString()}
          bgIcon="bg-amber-50"
          ringIcon="ring-amber-600/20"
        />
        <StatsCard
          icon={<RefreshCw className="h-6 w-6 text-blue-600" />}
          label="Diproses"
          value={stats.processing.toString()}
          bgIcon="bg-blue-50"
          ringIcon="ring-blue-600/20"
        />
        <StatsCard
          icon={<CheckCircle2 className="h-6 w-6 text-sage" />}
          label="Selesai"
          value={stats.completed.toString()}
          bgIcon="bg-sage/10"
          ringIcon="ring-sage/20"
        />
      </div>

      {/* Main Content Card */}
      <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-warm-sand/30 overflow-hidden animate-fade-in-up [animation-delay:200ms]">
        <OrderFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-terracotta" />
          </div>
        ) : (
          <>
            <OrderTable orders={orders} />
            {/* Pagination Footer - Visual Only for now */}
            <div className="bg-cream/30 p-4 md:p-6 border-t border-warm-sand/30 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-8 text-sm font-bold text-warm-gray">
              <span>Menampilkan {orders.length} pesanan</span>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white ring-1 ring-warm-sand/50 text-dark-brown hover:bg-terracotta hover:text-white transition-all disabled:opacity-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-6">Halaman 1</span>
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white ring-1 ring-warm-sand/50 text-dark-brown hover:bg-terracotta hover:text-white transition-all disabled:opacity-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
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

import {
  ListOrdered,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
