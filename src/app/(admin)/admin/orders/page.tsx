"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import { apiFetch } from "@/lib/api-client";
import type { AdminOrderListItem, AdminOrderListResponse } from "@/types/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const res = await apiFetch<AdminOrderListResponse>(
      `/api/admin/orders?${params}`
    );
    if (res.success) {
      setOrders(res.data.orders);
    }
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timeout);
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pesanan</h1>
      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
}
