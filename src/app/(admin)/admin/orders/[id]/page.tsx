"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/order/status-badge";
import { OrderStatusTracker } from "@/components/order/order-status-tracker";
import { OrderDetailCard } from "@/components/admin/orders/order-detail-card";
import { OrderItemsTable } from "@/components/admin/orders/order-items-table";
import { StatusUpdate } from "@/components/admin/orders/status-update";
import { TrackingForm } from "@/components/admin/orders/tracking-form";
import { PaymentProofReview } from "@/components/admin/orders/payment-proof-review";
import { apiFetch } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import type { AdminOrderDetail } from "@/types/api";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const res = await apiFetch<AdminOrderDetail>(
      `/api/admin/orders/${params.id}`
    );
    if (res.success) {
      setOrder(res.data);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pesanan tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/orders">Kembali</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderCode}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <OrderStatusTracker status={order.status} />

      <div className="grid lg:grid-cols-2 gap-6">
        <OrderDetailCard order={order} />
        <StatusUpdate
          orderId={order.id}
          currentStatus={order.status}
          onUpdated={fetchOrder}
        />
      </div>

      <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />

      <TrackingForm
        orderId={order.id}
        currentTracking={order.trackingNumber}
        currentCourier={order.courier}
        onUpdated={fetchOrder}
      />

      <PaymentProofReview proofs={order.paymentProofs} onUpdated={fetchOrder} />
    </div>
  );
}
