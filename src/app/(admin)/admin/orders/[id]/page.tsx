"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Truck,
  Package2,
  Image as ImageIcon,
  Maximize2,
  Receipt,
  CheckCircle,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Loader2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import type { AdminOrderDetail } from "@/types/api";
import { PaymentProofStatus } from "@prisma/client";
import { ProofImageDialog } from "@/components/admin/orders/proof-image-dialog";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewProofImage, setViewProofImage] = useState<string | null>(null);

  // States for tracking update
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");

  const fetchOrder = useCallback(async () => {
    const res = await apiFetch<AdminOrderDetail>(
      `/api/admin/orders/${params.id}`,
    );
    if (res.success) {
      setOrder(res.data);
      // Initialize tracking states
      setTrackingNumber(res.data.trackingNumber || "");
      setCourier(res.data.courier || "");
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/orders/${order.id}/status`, {
      status: newStatus,
    });
    setActionLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Status pesanan diperbarui");
    fetchOrder();
  };

  const handleUpdateTracking = async () => {
    if (!order) return;
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/orders/${order.id}/tracking`, {
      trackingNumber,
      courier,
    });
    setActionLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Informasi pengiriman diperbarui");
    setIsEditingTracking(false);
    fetchOrder();
  };

  const handleReviewProof = async (
    proofId: string,
    status: PaymentProofStatus,
  ) => {
    setActionLoading(true);
    const res = await apiPatch(`/api/admin/payment-proofs/${proofId}`, {
      status,
    });

    if (!res.success) {
      setActionLoading(false);
      toast.error((res as { error: string }).error);
      return;
    }

    // If approving, also update order status to PAID if it was PENDING_PAYMENT or AWAITING_VERIFICATION
    if (
      status === PaymentProofStatus.APPROVED &&
      (order?.status === "PENDING_PAYMENT" ||
        order?.status === "AWAITING_VERIFICATION")
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
        <p className="text-muted-foreground">Order not found</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 text-terracotta hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const pendingProof =
    order.paymentProofs.find((p) => p.status === PaymentProofStatus.PENDING) ||
    order.paymentProofs[0];

  // Define the ordered steps
  const ORDER_STEPS = [
    { label: "Pesanan Dibuat", status: "PENDING_PAYMENT", step: 1 },
    { label: "Verifikasi", status: "AWAITING_VERIFICATION", step: 2 },
    { label: "Dibayar", status: "PAID", step: 3 },
    { label: "Diproses", status: "PROCESSING", step: 4 },
    { label: "Dalam Perjalanan", status: "SHIPPED", step: 5 },
    { label: "Sampai Tujuan", status: "COMPLETED", step: 6 },
  ];

  const getCurrentStep = (status: string) => {
    if (status === "CANCELLED") return -1;
    const index = ORDER_STEPS.findIndex((s) => s.status === status);
    // If status is not exactly one of the steps (e.g. maybe some intermediate state), fallback
    // For specific logic:
    // If PENDING_PAYMENT -> Step 1
    // If Payment Uploaded but Pending -> Step 2 (AWAITING_VERIFICATION)
    // If PAID -> Step 3
    // If PROCESSING -> Step 4
    // If SHIPPED -> Step 5
    // If COMPLETED -> Step 6
    return index !== -1 ? index + 1 : 0;
  };

  const currentStep = order ? getCurrentStep(order.status) : 0;

  const handleShipOrder = () => {
    if (!order) return;

    // Check if tracking details are present
    if (!order.trackingNumber || !order.courier) {
      toast.error(
        "Mohon lengkapi Kurir dan No. Resi pada bagian Delivery Information terlebih dahulu.",
      );
      setIsEditingTracking(true);
      // Scroll to delivery section
      const deliverySection = document.getElementById("delivery-section");
      if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    handleUpdateStatus("SHIPPED");
  };

  return (
    <div className="flex flex-col h-full bg-cream/30">
      {/* Main Content - Responsive Padding & Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-fade-in-up">
          {/* Header Card with Stepper */}
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
                    Order #{order.orderCode}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-bold text-warm-gray uppercase tracking-widest mt-1 truncate">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {order.status !== "CANCELLED" &&
                  order.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleUpdateStatus("CANCELLED")}
                      disabled={actionLoading}
                      className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-warm-sand text-warm-gray font-bold text-xs sm:text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  )}

                {/* PAID -> PROCESSING */}
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

                {/* PROCESSING -> SHIPPED */}
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

                {/* SHIPPED -> COMPLETED */}
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

            {/* Stepper Visualization */}
            {order.status !== "CANCELLED" && (
              <div className="w-full relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-cream -translate-y-1/2 rounded-full -z-0"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-sage -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out -z-0"
                  style={{
                    width: `${((currentStep - 1) / (ORDER_STEPS.length - 1)) * 100}%`,
                  }}
                ></div>
                <div className="flex justify-between relative z-10 w-full">
                  {ORDER_STEPS.map((step, idx) => {
                    const isActive = idx + 1 <= currentStep;
                    const isCurrent = idx + 1 === currentStep;
                    return (
                      <div
                        key={step.step}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ${
                            isActive
                              ? "bg-sage text-white ring-white shadow-lg scale-110"
                              : "bg-cream text-warm-gray ring-white"
                          } ${isCurrent ? "ring-sage/20 scale-125" : ""}`}
                        >
                          {isActive ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            step.step
                          )}
                        </div>
                        <span
                          className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                            isActive ? "text-sage" : "text-warm-gray/60"
                          } ${isCurrent ? "text-dark-brown" : ""}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Mobile Label for Current Step Only */}
                <div className="mt-4 text-center sm:hidden">
                  <p className="text-xs font-black uppercase tracking-widest text-dark-brown">
                    Step {currentStep}: {ORDER_STEPS[currentStep - 1]?.label}
                  </p>
                </div>
              </div>
            )}
            {order.status === "CANCELLED" && (
              <div className="w-full p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center gap-2 text-red-600 font-bold">
                <XCircle className="h-5 w-5" />
                Pesanan Dibatalkan
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Items Summary */}
              <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown flex items-center gap-2">
                    <Package2 className="text-sage h-5 w-5 sm:h-6 sm:w-6" />
                    Items Summary
                  </h2>
                  <span className="text-sm font-bold text-warm-gray">
                    {order.items.length} Items
                  </span>
                </div>

                {/* Items Summaries for Mobile: Card View */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {order.items.map((item) => {
                    let accSnapshots: { name: string; price: number }[] = [];
                    if (item.accessoriesSnapshot) {
                      try {
                        accSnapshots = JSON.parse(item.accessoriesSnapshot);
                      } catch {}
                    }
                    const accTotal = item.accessoriesTotal || 0;
                    const unitWithAcc = item.unitPriceSnapshot + accTotal;
                    return (
                      <div
                        key={item.id}
                        className="bg-cream/20 p-5 rounded-[28px] ring-1 ring-warm-sand/30 space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-warm-sand/20 flex shrink-0 items-center justify-center ring-1 ring-warm-sand/50 overflow-hidden relative">
                            <ImageIcon className="text-xl text-warm-gray/30 absolute" />
                          </div>
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-dark-brown text-sm line-clamp-2 leading-tight">
                              {item.productNameSnapshot}
                            </p>
                            <p className="text-[10px] text-warm-gray mt-1 italic font-medium">
                              ID: {item.product.slug}
                            </p>
                            {accSnapshots.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {accSnapshots.map((acc, idx) => (
                                  <p
                                    key={idx}
                                    className="text-[10px] text-sage font-bold leading-tight"
                                  >
                                    + {acc.name} ({formatCurrency(acc.price)})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-warm-sand/30">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60">
                              Qty
                            </span>
                            <span className="font-bold text-dark-brown text-sm">
                              {item.quantity}×
                            </span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60">
                              Total
                            </span>
                            <span className="font-black text-terracotta text-sm">
                              {formatCurrency(unitWithAcc * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items Summary for Desktop: Table View */}
                <div className="hidden sm:block overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0 scrollbar-hide">
                  <table className="w-full min-w-[600px]">
                    <thead className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray/60 border-b border-warm-sand/30">
                      <tr className="text-left">
                        <th className="pb-4">Product</th>
                        <th className="pb-4 text-center">Qty</th>
                        <th className="pb-4 text-right">Price</th>
                        <th className="pb-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-sand/20">
                      {order.items.map((item) => {
                        let accSnapshots: { name: string; price: number }[] = [];
                        if (item.accessoriesSnapshot) {
                          try {
                            accSnapshots = JSON.parse(item.accessoriesSnapshot);
                          } catch {}
                        }
                        const accTotal = item.accessoriesTotal || 0;
                        const unitWithAcc = item.unitPriceSnapshot + accTotal;
                        return (
                          <tr key={item.id} className="group">
                            <td className="py-5">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-warm-sand/20 flex shrink-0 items-center justify-center ring-1 ring-warm-sand/50 overflow-hidden relative">
                                  <ImageIcon className="text-2xl text-warm-gray/30 absolute" />
                                </div>
                                <div className="min-w-0 pr-2">
                                  <p className="font-bold text-dark-brown text-sm sm:text-base line-clamp-2">
                                    {item.productNameSnapshot}
                                  </p>
                                  {accSnapshots.length > 0 && (
                                    <div className="mt-0.5 space-y-0.5">
                                      {accSnapshots.map((acc, idx) => (
                                        <p
                                          key={idx}
                                          className="text-[11px] text-sage font-medium"
                                        >
                                          + {acc.name} (
                                          {formatCurrency(acc.price)})
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-xs text-warm-gray truncate font-medium">
                                    ID: {item.product.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 text-center font-bold text-dark-brown text-sm sm:text-base">
                              {item.quantity}
                            </td>
                            <td className="py-5 text-right text-sm text-warm-gray whitespace-nowrap font-medium">
                              {formatCurrency(unitWithAcc)}
                            </td>
                            <td className="py-5 text-right font-black text-dark-brown whitespace-nowrap">
                              {formatCurrency(unitWithAcc * item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-dashed border-warm-sand/40 flex justify-end">
                  <div className="w-full sm:w-64 space-y-3">
                    <div className="flex justify-between text-sm text-warm-gray">
                      <span className="font-medium">Subtotal Produk</span>
                      <span className="font-bold">
                        {formatCurrency(order.totalAmount + (order.discountAmount ?? 0) - (order.shippingCost ?? 0))}
                      </span>
                    </div>
                    {(order.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-sage">
                        <span className="font-medium">
                          Diskon{order.couponCode ? ` (${order.couponCode})` : ""}
                        </span>
                        <span className="font-bold">
                          -{formatCurrency(order.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-warm-gray">
                      <span className="font-medium">
                        Ongkir
                        {order.shippingZoneSnapshot && (() => {
                          try {
                            const snap = JSON.parse(order.shippingZoneSnapshot);
                            return ` (${snap.name})`;
                          } catch { return ""; }
                        })()}
                      </span>
                      <span className="font-bold">
                        {(order.shippingCost ?? 0) === 0
                          ? <span className="text-sage">Gratis</span>
                          : formatCurrency(order.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg pt-2">
                      <span className="font-display font-black text-dark-brown">
                        Grand Total
                      </span>
                      <span className="font-display font-black text-terracotta">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery Information */}
              <section
                id="delivery-section"
                className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown flex items-center gap-2">
                    <Truck className="text-sage h-5 w-5 sm:h-6 sm:w-6" />
                    Delivery Information
                  </h2>
                  <button
                    onClick={() => setIsEditingTracking(!isEditingTracking)}
                    className="text-xs font-bold text-terracotta hover:underline"
                  >
                    {isEditingTracking ? "Cancel Edit" : "Edit Details"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
                      Shipping Address
                    </p>
                    <div className="bg-cream/40 p-5 rounded-3xl ring-1 ring-warm-sand/30">
                      <p className="font-bold text-dark-brown">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-warm-gray leading-relaxed mt-1 whitespace-pre-wrap break-words">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
                      Logistic Details
                    </p>
                    {isEditingTracking ? (
                      <div className="space-y-3 bg-cream/20 p-4 rounded-3xl ring-1 ring-warm-sand/30">
                        <div>
                          <label className="text-xs font-bold text-dark-brown block mb-1">
                            Courier
                          </label>
                          <input
                            value={courier}
                            onChange={(e) => setCourier(e.target.value)}
                            className="w-full rounded-xl border-warm-sand/50 bg-white px-3 py-2 text-sm"
                            placeholder="e.g. JNE"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-dark-brown block mb-1">
                            Tracking Code
                          </label>
                          <input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="w-full rounded-xl border-warm-sand/50 bg-white px-3 py-2 text-sm"
                            placeholder="e.g. JBX123456789"
                          />
                        </div>
                        <button
                          onClick={handleUpdateTracking}
                          disabled={actionLoading}
                          className="w-full rounded-full bg-dark-brown text-white py-2 text-xs font-bold"
                        >
                          Save Details
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-cream flex items-center justify-center text-warm-gray">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-dark-brown">
                              {order.courier || "Not set"}
                            </p>
                            <p className="text-[10px] text-warm-gray">
                              Courier Service
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-cream flex items-center justify-center text-warm-gray">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-dark-brown truncate">
                              {order.trackingNumber || "Not available yet"}
                            </p>
                            <p className="text-[10px] text-warm-gray italic">
                              Tracking Code
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Payment Proof */}
              <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown">
                    Payment Proof
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold ring-1 ring-inset ${
                      pendingProof?.status === "APPROVED"
                        ? "bg-sage/10 text-sage ring-sage/20"
                        : pendingProof?.status === "REJECTED"
                          ? "bg-red-50 text-red-600 ring-red-200"
                          : "bg-amber-50 text-amber-600 ring-amber-600/20"
                    }`}
                  >
                    {pendingProof?.status || "No Proof"}
                  </span>
                </div>

                {pendingProof ? (
                  <div className="group relative overflow-hidden rounded-[24px] sm:rounded-[30px] aspect-[3/4] bg-cream shadow-inner flex items-center justify-center bg-gray-100">
                    <Image
                      src={getImageUrl(pendingProof.imageUrl)}
                      alt="Payment Proof"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div
                      className="absolute inset-0 bg-dark-brown/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10 cursor-zoom-in"
                      onClick={() =>
                        setViewProofImage(getImageUrl(pendingProof.imageUrl))
                      }
                    >
                      <Maximize2 className="text-3xl text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] sm:rounded-[30px] aspect-[3/4] bg-cream/50 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-warm-sand/30">
                    <Receipt className="text-4xl sm:text-5xl text-warm-sand mb-4" />
                    <p className="text-xs font-bold text-warm-gray leading-relaxed">
                      No payment proof uploaded yet.
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {pendingProof && pendingProof.status === "PENDING" && (
                    <button
                      onClick={() =>
                        handleReviewProof(
                          pendingProof.id,
                          PaymentProofStatus.APPROVED,
                        )
                      }
                      disabled={actionLoading}
                      className="w-full bg-terracotta text-white rounded-full py-3.5 sm:py-4 font-bold shadow-lg hover:shadow-terracotta/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Mark as Verified Paid
                    </button>
                  )}
                  {pendingProof && pendingProof.status === "PENDING" && (
                    <button
                      onClick={() =>
                        handleReviewProof(
                          pendingProof.id,
                          PaymentProofStatus.REJECTED,
                        )
                      }
                      disabled={actionLoading}
                      className="w-full bg-red-50 text-red-600 border border-red-100 rounded-full py-3.5 sm:py-4 font-bold shadow-sm hover:bg-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject Proof
                    </button>
                  )}
                </div>
              </section>

              {/* Customer */}
              <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown mb-6">
                  Customer
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-terracotta/10 flex items-center justify-center ring-2 ring-terracotta/20 shrink-0">
                    <User className="text-2xl text-terracotta" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-dark-brown leading-tight truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs font-bold text-sage uppercase tracking-wider">
                      Customer
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-warm-gray h-4 w-4 shrink-0" />
                    <span className="text-dark-brown font-medium truncate">
                      {order.customerEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-warm-gray h-4 w-4 shrink-0" />
                    <span className="text-dark-brown font-medium">
                      {order.customerPhone}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-warm-sand/30">
                  <button className="w-full bg-cream text-dark-brown rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-warm-sand transition-colors">
                    <MessageCircle className="text-lg" />
                    Chat Customer
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <ProofImageDialog
        imageUrl={viewProofImage}
        open={!!viewProofImage}
        onClose={() => setViewProofImage(null)}
      />
    </div>
  );
}
