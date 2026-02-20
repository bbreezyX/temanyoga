"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Truck,
  Package2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import type { AdminOrderDetail } from "@/types/api";
import { PaymentProofStatus, OrderStatus } from "@prisma/client";
import { ProofImageDialog } from "@/components/admin/orders/proof-image-dialog";
import { OrderStepper } from "@/components/admin/orders/order-stepper";
import { OrderItemsSection } from "@/components/admin/orders/order-items-section";
import { OrderDeliverySection } from "@/components/admin/orders/order-delivery-section";
import { OrderPaymentSection } from "@/components/admin/orders/order-payment-section";
import { OrderCustomerSection } from "@/components/admin/orders/order-customer-section";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);

useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      setLoading(true);
      const res = await apiFetch<AdminOrderDetail>(
        `/api/admin/orders/${params.id}`,
      );
      if (mounted) {
        if (res.success) {
          setOrder(res.data);
        }
        setLoading(false);
      }
    };
    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    const res = await apiFetch<AdminOrderDetail>(
      `/api/admin/orders/${params.id}`,
    );
    if (res.success) {
      setOrder(res.data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    const previousStatus = order.status;
    setOrder({ ...order, status: newStatus as AdminOrderDetail["status"] });
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/orders/${order.id}/status`, {
      status: newStatus,
    });
    setActionLoading(false);

    if (!res.success) {
      setOrder({ ...order, status: previousStatus });
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Status pesanan diperbarui");
    fetchOrder();
  };

  const handleUpdateTracking = async (
    courier: string,
    trackingNumber: string,
  ) => {
    if (!order) return;
    const prevCourier = order.courier;
    const prevTracking = order.trackingNumber;
    setOrder({ ...order, courier, trackingNumber });
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/orders/${order.id}/tracking`, {
      trackingNumber,
      courier,
    });
    setActionLoading(false);

    if (!res.success) {
      setOrder({ ...order, courier: prevCourier, trackingNumber: prevTracking });
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Informasi pengiriman diperbarui");
    fetchOrder();
  };

  const handleReviewProof = async (
    proofId: string,
    status: PaymentProofStatus,
  ) => {
    if (!order) return;
    const prevProofs = order.paymentProofs;
    const prevStatus = order.status;
    
    const updatedProofs = order.paymentProofs.map((p) =>
      p.id === proofId
        ? { ...p, status, reviewedAt: new Date().toISOString() }
        : p,
    );
    const newOrderStatus =
      status === PaymentProofStatus.APPROVED &&
      (order.status === "PENDING_PAYMENT" ||
        order.status === "AWAITING_VERIFICATION")
        ? ("PAID" as OrderStatus)
        : order.status;
    setOrder({ ...order, paymentProofs: updatedProofs, status: newOrderStatus });
    
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/payment-proofs/${proofId}`, {
      status,
    });

    if (!res.success) {
      setOrder({ ...order, paymentProofs: prevProofs, status: prevStatus });
      setActionLoading(false);
      toast.error((res as { error: string }).error);
      return;
    }

    if (
      status === PaymentProofStatus.APPROVED &&
      (order.status === "PENDING_PAYMENT" ||
        order.status === "AWAITING_VERIFICATION")
    ) {
      await apiPatch(`/api/admin/orders/${order.id}/status`, {
        status: "PAID",
      });
      toast.success("Bukti disetujui & status pesanan menjadi PAID");
    } else {
      toast.success(
        status === PaymentProofStatus.APPROVED
          ? "Bukti disetujui"
          : "Bukti ditolak",
      );
    }

    setActionLoading(false);
    fetchOrder();
  };

  const handleShipOrder = () => {
    if (!order) return;

    if (!order.trackingNumber || !order.courier) {
      toast.error(
        "Mohon lengkapi Kurir dan No. Resi pada bagian Delivery Information terlebih dahulu.",
      );
      const deliverySection = document.getElementById("delivery-section");
      if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    handleUpdateStatus("SHIPPED");
  };

  const parsedShippingZone = useMemo(() => {
    if (!order?.shippingZoneSnapshot) return null;
    try {
      return JSON.parse(order.shippingZoneSnapshot) as { name: string };
    } catch {
      return null;
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground font-medium">
          Pesanan tidak ditemukan
        </p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 text-terracotta border border-terracotta/20 rounded-full px-6 py-2 hover:bg-terracotta/5 transition-all text-sm font-bold"
        >
          Kembali ke Pesanan
        </button>
      </div>
    );
  }

  const pendingProof =
    order.paymentProofs.find((p) => p.status === PaymentProofStatus.PENDING) ||
    order.paymentProofs[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-fade-in-up">
      <div className="flex flex-col bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30 gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              href="/admin/orders"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-warm-gray hover:bg-warm-sand hover:text-dark-brown transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown tracking-tight leading-none truncate">
                Pesanan #{order.orderCode}
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold text-warm-gray uppercase tracking-widest mt-1 truncate">
                Dipesan pada {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
              <button
                onClick={() => handleUpdateStatus("CANCELLED")}
                disabled={actionLoading}
                className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-warm-sand text-warm-gray font-bold text-xs sm:text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
              >
                Batalkan
              </button>
            )}

            {order.status === "PAID" && (
              <button
                onClick={() => handleUpdateStatus("PROCESSING")}
                disabled={actionLoading}
                className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-dark-brown text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Package2 className="h-4 w-4" />
                Proses Pesanan
              </button>
            )}

            {order.status === "PROCESSING" && (
              <button
                onClick={handleShipOrder}
                disabled={actionLoading}
                className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-dark-brown text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Truck className="h-4 w-4" />
                Kirim Pesanan
              </button>
            )}

            {order.status === "SHIPPED" && (
              <button
                onClick={() => handleUpdateStatus("COMPLETED")}
                disabled={actionLoading}
                className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-sage text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Pesanan Selesai
              </button>
            )}
          </div>
        </div>

        <OrderStepper status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <OrderItemsSection
            items={order.items.map((item) => ({
              id: item.id,
              productNameSnapshot: item.productNameSnapshot,
              quantity: item.quantity,
              unitPriceSnapshot: item.unitPriceSnapshot,
              accessoriesTotal: item.accessoriesTotal,
              accessoriesSnapshot: item.accessoriesSnapshot,
              product: {
                slug: item.product.slug,
                images: item.product.images,
              },
            }))}
            totalAmount={order.totalAmount}
            discountAmount={order.discountAmount}
            shippingCost={order.shippingCost}
            couponCode={order.couponCode}
            shippingZoneName={parsedShippingZone?.name ?? null}
          />

          <OrderDeliverySection
            customerName={order.customerName}
            shippingAddress={order.shippingAddress}
            courier={order.courier}
            trackingNumber={order.trackingNumber}
            onUpdateTracking={handleUpdateTracking}
            actionLoading={actionLoading}
          />
        </div>

        <div className="space-y-6 lg:space-y-8">
          <OrderPaymentSection
            paymentProof={pendingProof}
            onReviewProof={handleReviewProof}
            onViewImage={setViewProofImage}
            actionLoading={actionLoading}
          />

          <OrderCustomerSection
            customerName={order.customerName}
            customerEmail={order.customerEmail}
            customerPhone={order.customerPhone}
          />
        </div>
      </div>

      <ProofImageDialog
        imageUrl={viewProofImage}
        open={!!viewProofImage}
        onClose={() => setViewProofImage(null)}
      />
    </div>
  );
}