"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Wallet,
  Banknote,
  Layers,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  Truck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiFetch, apiPatch } from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/order/status-badge";
import type { AdminDashboardStats } from "@/types/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await apiFetch<AdminDashboardStats>("/api/admin/dashboard");
    if (res.success) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await apiPatch(`/api/admin/orders/${id}/status`, {
        status: newStatus,
      });
      if (res.success) {
        await fetchData();
      } else {
        alert((res as { error: string }).error || "Failed to update status");
      }
    } catch (err) {
      alert("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Today's Orders",
      value: data.todayOrders.toString(),
      icon: ShoppingBag,
      trend: "Today",
      trendType: "neutral",
      color: "primary",
    },
    {
      label: "Pending Payments",
      value: data.pendingPayments.toString(),
      icon: Wallet,
      trend: "Action Required",
      trendType: "down",
      color: "sage",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: Banknote,
      trend: "All Time",
      trendType: "up",
      color: "warm-gray",
    },
    {
      label: "Total Products",
      value: data.totalProducts.toString(),
      icon: Layers,
      trend: "Active",
      trendType: "neutral",
      color: "dark-brown",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-muted-foreground font-medium">
          Welcome back. Here&apos;s what&apos;s happening in your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up [animation-delay:100ms]">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group rounded-[32px] bg-card p-6 shadow-soft transition-all hover:scale-[1.02] ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full ring-1",
                  stat.color === "primary"
                    ? "bg-primary/5 text-primary ring-primary/10"
                    : stat.color === "sage"
                      ? "bg-sage/5 text-sage ring-sage/10"
                      : stat.color === "warm-gray"
                        ? "bg-warm-gray/5 text-warm-gray ring-warm-gray/10"
                        : "bg-foreground/5 text-foreground ring-foreground/10",
                )}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-[13px] font-bold",
                  stat.trendType === "up"
                    ? "text-sage"
                    : stat.trendType === "down"
                      ? "text-terracotta"
                      : "text-muted-foreground",
                )}
              >
                {stat.trendType === "up" && <TrendingUp className="h-3 w-3" />}
                {stat.trendType === "down" && (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-[40px] bg-card p-4 md:p-8 shadow-soft ring-1 ring-border animate-fade-in-up [animation-delay:200ms]">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-display text-xl md:text-2xl font-extrabold text-foreground">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-border/60 ring-1 ring-border w-full md:w-auto"
          >
            View All Orders
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border text-[12px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="pb-4 pl-4">Order Code</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.recentOrders.map((order, i) => (
                <tr
                  key={i}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <td className="py-5 pl-4">
                    <span className="font-display font-bold text-foreground">
                      #{order.orderCode}
                    </span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center text-[10px] font-bold text-foreground uppercase">
                        {order.customerName.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-5 text-sm font-bold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Contextual Action Button */}
                      {updatingId === order.id ? (
                        <div className="h-9 w-9 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          {order.status === "AWAITING_VERIFICATION" && (
                            <Link href={`/admin/orders/${order.id}`}>
                              <button
                                title="Verify Payment"
                                className="h-9 w-9 flex items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-all shadow-sm"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          {order.status === "PAID" && (
                            <button
                              title="Set to Processing"
                              onClick={() =>
                                handleUpdateStatus(order.id, "PROCESSING")
                              }
                              className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm ring-1 ring-blue-600/10"
                            >
                              <Layers className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === "PROCESSING" && (
                            <Link href={`/admin/orders/${order.id}`}>
                              <button
                                title="Ship Order"
                                className="h-9 w-9 flex items-center justify-center rounded-full bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white transition-all shadow-sm"
                              >
                                <Truck className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          {order.status === "SHIPPED" && (
                            <button
                              title="Mark as Completed"
                              onClick={() =>
                                handleUpdateStatus(order.id, "COMPLETED")
                              }
                              className="h-9 w-9 flex items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-all shadow-sm ring-1 ring-sage/60"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          <Link href={`/admin/orders/${order.id}`}>
                            <button
                              title="View Detail"
                              className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:scale-110 transition-all active:scale-95"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {data.recentOrders.map((order, i) => (
            <div
              key={i}
              className="rounded-2xl bg-muted/20 p-4 ring-1 ring-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-foreground text-lg">
                  #{order.orderCode}
                </span>
                <StatusBadge status={order.status} />
              </div>

              <div className="flex items-center gap-3 mb-4 p-3 bg-card rounded-xl border border-border/50">
                <div className="h-10 w-10 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center text-xs font-bold text-foreground uppercase shrink-0">
                  {order.customerName.slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {order.customerName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              <div className="flex gap-2">
                {/* Mobile Contextual Actions */}
                {updatingId === order.id ? (
                   <div className="flex-1 h-10 flex items-center justify-center bg-muted/20 rounded-xl">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                ) : (
                  <>
                    {/* Primary Action Button (if any) */}
                     {order.status === "AWAITING_VERIFICATION" && (
                        <Link href={`/admin/orders/${order.id}`} className="flex-1">
                          <button className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-sage text-white font-bold shadow-sm">
                            <CheckCircle className="h-4 w-4" /> Verify
                          </button>
                        </Link>
                      )}
                      {order.status === "PAID" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                          className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-bold shadow-sm"
                        >
                          <Layers className="h-4 w-4" /> Process
                        </button>
                      )}
                      {order.status === "PROCESSING" && (
                        <Link href={`/admin/orders/${order.id}`} className="flex-1">
                          <button className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-terracotta text-white font-bold shadow-sm">
                            <Truck className="h-4 w-4" /> Ship
                          </button>
                        </Link>
                      )}
                      {order.status === "SHIPPED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                          className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-sage text-white font-bold shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4" /> Complete
                        </button>
                      )}

                    {/* View Details Button */}
                    <Link href={`/admin/orders/${order.id}`} className="flex-1">
                      <button className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-card text-foreground border border-border hover:bg-muted font-bold shadow-sm">
                        <Eye className="h-4 w-4" /> Details
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.recentOrders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground font-medium">
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  );
}
