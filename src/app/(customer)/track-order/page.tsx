"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusTracker } from "@/components/order/order-status-tracker";
import { StatusBadge } from "@/components/order/status-badge";
import { PaymentProofUpload } from "@/components/order/payment-proof-upload";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { OrderStatus } from "@/generated/prisma/enums";
import type { OrderStatusResponse } from "@/types/api";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrder(orderCode: string) {
    if (!orderCode.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await apiFetch<OrderStatusResponse>(
      `/api/orders/${orderCode.trim()}/status`
    );
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setOrder(res.data);
  }

  useEffect(() => {
    if (initialCode) fetchOrder(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOrder(code);
  }

  const canUploadProof =
    order &&
    (order.status === OrderStatus.PENDING_PAYMENT ||
      order.status === OrderStatus.AWAITING_VERIFICATION);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Cek Status Pesanan</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <Input
          placeholder="Masukkan kode pesanan (ORD-...)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" disabled={loading || !code.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {order && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{order.orderCode}</CardTitle>
                <StatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderStatusTracker status={order.status} />

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal Pesan</p>
                  <p className="font-semibold">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                {order.trackingNumber && (
                  <>
                    <div>
                      <p className="text-muted-foreground">No. Resi</p>
                      <p className="font-mono font-semibold">
                        {order.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kurir</p>
                      <p className="font-semibold">{order.courier}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {canUploadProof && (
            <PaymentProofUpload
              orderCode={order.orderCode}
              onUploaded={() => fetchOrder(order.orderCode)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
