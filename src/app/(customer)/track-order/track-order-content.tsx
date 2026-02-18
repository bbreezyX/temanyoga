"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  Package,
  Calendar,
  Truck,
  ArrowRight,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import type { OrderStatusResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";

const STEP_ICONS = {
  PENDING_PAYMENT: Clock,
  AWAITING_VERIFICATION: ShieldCheck,
  PAID: CreditCard,
  PROCESSING: Package,
  SHIPPED: Truck,
  COMPLETED: CheckCircle2,
} as const;

const STEP_CONFIG = [
  {
    status: "PENDING_PAYMENT",
    label: "Pesanan Dibuat",
    sub: "Menunggu pembayaran",
  },
  {
    status: "AWAITING_VERIFICATION",
    label: "Verifikasi",
    sub: "Bukti sedang dicek",
  },
  { status: "PAID", label: "Dibayar", sub: "Pembayaran diverifikasi" },
  { status: "PROCESSING", label: "Diproses", sub: "Produk sedang disiapkan" },
  { status: "SHIPPED", label: "Dikirim", sub: "Pesanan dalam perjalanan" },
  { status: "COMPLETED", label: "Selesai", sub: "Pesanan telah diterima" },
] as const;

const STEP_STATUS_VALUES: readonly string[] = STEP_CONFIG.map((s) => s.status);

const StepItem = memo(function StepItem({
  step,
  isCompleted,
  isPast,
  isActive,
  isLast,
}: {
  step: (typeof STEP_CONFIG)[number];
  isCompleted: boolean;
  isPast: boolean;
  isActive: boolean;
  isLast: boolean;
}) {
  const Icon = STEP_ICONS[step.status as keyof typeof STEP_ICONS];

  return (
    <div className="flex md:flex-col items-center md:items-center gap-5 md:gap-4 group relative">
      {!isLast && (
        <div className="md:hidden absolute left-[28px] top-[56px] w-[2px] h-[calc(100%-40px)] bg-[#f9f9f9] -z-10">
          <div
            className={cn(
              "w-full bg-[#c85a2d] origin-top transition-transform duration-300 will-change-transform",
              isPast ? "scale-y-100" : "scale-y-0",
            )}
          />
        </div>
      )}
      <div
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 z-10",
          isCompleted
            ? "bg-[#2d241c] text-white shadow-lift-sm"
            : "bg-white text-[#9a8772] border border-[#e8dcc8]/60",
          isActive &&
            "bg-[#c85a2d] text-white scale-110 shadow-lift-sm border-none",
        )}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      <div className="text-left md:text-center flex flex-col pt-1">
        <span
          className={cn(
            "text-sm md:text-[15px] font-black leading-tight uppercase tracking-wider",
            isCompleted ? "text-[#2d241c]" : "text-[#9a8772]",
            isActive && "text-[#c85a2d]",
          )}
        >
          {step.label}
        </span>
        <span
          className={cn(
            "text-[10px] md:text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60",
            isActive ? "text-[#c85a2d]" : "text-[#6b5b4b]",
          )}
        >
          {step.sub}
        </span>
      </div>
    </div>
  );
});

const OrderStatusBadge = memo(function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  return (
    <div
      className={cn(
        "px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] border",
        status === "COMPLETED"
          ? "bg-[#7a9d7f]/10 text-[#7a9d7f] border-[#7a9d7f]/20"
          : status === "CANCELLED"
            ? "bg-red-50 text-red-600 border-red-100"
            : "bg-[#c85a2d]/10 text-[#c85a2d] border-[#c85a2d]/20",
      )}
    >
      {status.replace(/_/g, " ")}
    </div>
  );
});

const JourneyTrack = memo(function JourneyTrack({
  activeStep,
}: {
  activeStep: number;
}) {
  const progressWidth = useMemo(
    () => `${(Math.max(0, activeStep) / (STEP_CONFIG.length - 1)) * 100}%`,
    [activeStep],
  );

  return (
    <div className="relative">
      <div className="hidden md:block absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-[#f9f9f9] z-0">
        <div
          className="absolute top-0 left-0 h-full bg-[#2d241c] transition-[width] duration-500 ease-out will-change-[width]"
          style={{ width: progressWidth }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4 relative z-10">
        {STEP_CONFIG.map((step, i) => (
          <StepItem
            key={step.status}
            step={step}
            isCompleted={i <= activeStep}
            isPast={i < activeStep}
            isActive={i === activeStep}
            isLast={i === STEP_CONFIG.length - 1}
          />
        ))}
      </div>
    </div>
  );
});

const OrderCodeCard = memo(function OrderCodeCard({
  orderCode,
}: {
  orderCode: string;
}) {
  return (
    <div className="rounded-[40px] bg-white p-8 border border-[#e8dcc8]/60 flex flex-col justify-between group hover:border-[#c85a2d]/40 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#c85a2d] text-white flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform shadow-lift-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a8772]">
          Informasi Pesanan
        </span>
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em] mb-2">
          Kode Pesanan
        </h3>
        <p className="text-3xl font-mono font-black tracking-tight text-[#2d241c] group-hover:text-[#c85a2d] transition-colors">
          {orderCode}
        </p>
      </div>
    </div>
  );
});

const SummaryStats = memo(function SummaryStats({
  createdAt,
  totalAmount,
}: {
  createdAt: string;
  totalAmount: number;
}) {
  const formattedDate = useMemo(
    () =>
      new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [createdAt],
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-[32px] md:rounded-[40px] bg-[#f9f9f9] p-6 border border-[#e8dcc8]/60">
        <Calendar className="w-6 h-6 text-[#7a9d7f] mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b5b4b] mb-1">
          Tanggal
        </p>
        <p className="text-sm font-black text-[#2d241c]">{formattedDate}</p>
      </div>
      <div className="rounded-[32px] md:rounded-[40px] bg-[#f9f9f9] p-6 border border-[#e8dcc8]/60">
        <Package className="w-6 h-6 text-[#c85a2d] mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b5b4b] mb-1">
          Total
        </p>
        <p className="text-sm font-black text-[#c85a2d]">
          {formatCurrency(totalAmount)}
        </p>
      </div>
    </div>
  );
});

const DeliveryInfo = memo(function DeliveryInfo() {
  return (
    <div className="rounded-[40px] bg-white p-8 border border-[#e8dcc8]/60 relative group">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#f9f9f9] flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-[#9a8772]" />
        </div>
        <div className="space-y-4">
          <h4 className="text-[16px] font-black tracking-tight text-[#2d241c] uppercase tracking-wider">
            Informasi Produksi
          </h4>
          <p className="text-[13px] text-[#6b5b4b] leading-relaxed font-medium">
            Setiap produk dTeman dibuat secara manual dengan cinta. Proses
            handmade membutuhkan waktu ±3 minggu sebelum siap dikirim ke rumah
            Anda.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[12px] font-black text-[#c85a2d] hover:gap-3 transition-all uppercase tracking-widest"
          >
            Kembali Berbelanja <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
});

const PaymentAction = memo(function PaymentAction({
  orderCode,
}: {
  orderCode: string;
}) {
  return (
    <div className="rounded-[40px] bg-[#fdf8f6] p-8 md:p-12 border border-[#c85a2d]/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-floatIn">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-lift-sm flex items-center justify-center shrink-0">
          <CreditCard className="w-8 h-8 text-[#c85a2d]" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#2d241c] mb-2">
            Selesaikan Pembayaran
          </h3>
          <p className="text-[#6b5b4b] font-medium text-sm md:text-base">
            Transfer Anda dinanti untuk mulai menyiapkan dTeman pilihan Anda.
          </p>
        </div>
      </div>
      <Link
        href={`/checkout/success/${orderCode}`}
        className="group inline-flex items-center justify-center gap-3 h-16 px-10 rounded-full bg-[#c85a2d] text-white font-black text-[15px] uppercase tracking-widest hover:bg-[#2d241c] transition-all shadow-lift-sm whitespace-nowrap"
      >
        <span>Upload Bukti Bayar</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
});

const TrackingInfo = memo(function TrackingInfo({
  status,
  courier,
  trackingNumber,
  onCopy,
}: {
  status: "SHIPPED" | "COMPLETED";
  courier: string | null;
  trackingNumber: string;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="rounded-[48px] bg-[#2d241c] p-10 md:p-14 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c85a2d]/10 blur-[80px] -mr-40 -mt-40 pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-sm">
            <Package className="w-10 h-10 text-[#c85a2d]" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[#c85a2d] font-black uppercase tracking-[0.2em] text-[11px] mb-3">
              Informasi Pengirirman
            </p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              {status === "COMPLETED" ? "Pesanan Tiba!" : "Paket Dikirim"}
            </h3>
            <p className="text-white/60 font-medium text-sm md:text-base max-w-sm">
              <span className="text-white font-bold">
                {courier || "Ekspedisi"}
              </span>{" "}
              — Pesanan Anda sedang diproses oleh kurir terpercaya kami.
            </p>
          </div>
        </div>
        <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 backdrop-blur-md w-full lg:w-auto text-center md:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">
            Nomor Resi
          </p>
          <div className="flex items-center justify-center md:justify-start gap-5">
            <code className="text-2xl md:text-3xl font-mono font-black tracking-tight text-[#c85a2d]">
              {trackingNumber}
            </code>
            <button
              onClick={() => onCopy(trackingNumber)}
              className="w-12 h-12 rounded-full bg-white text-[#2d241c] flex items-center justify-center hover:bg-[#c85a2d] hover:text-white transition-all shadow-lift-sm"
              aria-label="Salin nomor resi"
            >
              <ClipboardCheck className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function TrackOrderContent({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(!!initialCode);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(
    async (targetCode: string) => {
      setLoading(true);
      setError("");

      const res = await apiFetch<OrderStatusResponse>(
        `/api/orders/${targetCode}/status`,
      );

      setLoading(false);

      if (!res.success) {
        setError(
          res.error || "Pesanan tidak ditemukan. Periksa kembali kode Anda.",
        );
        // If specific error, we might want to clear order, but keeping it for now in case of transient error
        // though normally if not found, we should clear it.
        if (!order) setOrder(null); // Ensure order is null if we didn't have one and failed
      } else {
        setOrder(res.data);
        if (res.data.status !== order?.status) {
          // Status updated, content will refresh automatically
        }
      }
    },
    [order],
  );

  useEffect(() => {
    if (initialCode?.trim()) {
      // Clear previous order data when code changes (navigation) to avoid mismatched data display
      setOrder(null);
      fetchOrder(initialCode.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedCode = code.trim();
      if (!trimmedCode) return;

      if (trimmedCode === initialCode) {
        fetchOrder(trimmedCode);
      } else {
        router.push(`/track-order/${trimmedCode}`);
      }
    },
    [code, initialCode, router, fetchOrder],
  );

  const activeStep = useMemo(() => {
    if (!order) return -1;
    const status = order.status;
    const index = STEP_STATUS_VALUES.indexOf(status);
    if (index === -1 && status === "CANCELLED") return -1;
    if (status === "PAID") return 2;
    if (status === "PROCESSING") return 3;
    return index;
  }, [order]);

  const copyTracking = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Nomor resi berhasil disalin!");
    },
    [toast],
  );

  const updatedAtFormatted = useMemo(() => {
    if (!order) return "";
    return new Date(order.updatedAt).toLocaleDateString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [order]);

  return (
    <div className="min-h-screen text-[#2d241c] font-sans selection:bg-[#c85a2d] selection:text-white bg-white">
      <section className="relative pt-8 md:pt-12 pb-12 md:pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="relative min-h-[50svh] flex flex-col items-center justify-center py-16 md:py-24 px-8 md:px-20 rounded-[80px] bg-[#f9f9f9] overflow-hidden border border-[#e8dcc8]/40">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#c85a2d]/5 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#7a9d7f]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl text-center">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-[#e8dcc8]/60 mb-10 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#c85a2d] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                D`Teman Order Tracking
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-[92px] leading-[0.9] tracking-[-0.04em] font-black text-[#2d241c] mb-8">
              Jejak Pesanan
            </h1>

            <p className="text-[16px] md:text-[20px] text-[#6b5b4b] mb-12 md:mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              Pantau perjalanan produk handmade Anda secara real-time. Masukkan
              kode pesanan untuk melihat detail status terbaru.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: ORD-2024..."
                  className="w-full h-20 md:h-24 rounded-[32px] bg-white px-10 pr-32 md:pr-40 text-lg md:text-2xl font-display font-black text-[#2d241c] border border-[#e8dcc8] focus:border-[#c85a2d] focus:outline-none shadow-lift-sm transition-all placeholder:text-[#9a8772]"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="absolute right-3 md:right-4 top-3 md:top-4 h-14 md:h-16 px-10 md:px-12 rounded-[24px] bg-[#2d241c] text-white font-black flex items-center justify-center gap-3 hover:bg-[#c85a2d] active:scale-95 transition-all disabled:opacity-30"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline text-sm uppercase tracking-widest">
                        Lacak
                      </span>
                      <Search className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="mt-8 p-5 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm inline-flex items-center gap-3 animate-floatIn">
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {order && (
        <section className="pb-24 md:pb-32 px-6 md:px-12 max-w-[1400px] mx-auto animate-floatIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
              <div className="rounded-[48px] bg-white p-10 md:p-14 border border-[#e8dcc8]/60 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7a9d7f]/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2d241c] mb-3">
                      Status Pesanan
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#7a9d7f] animate-pulse" />
                      <p className="text-[13px] font-bold text-[#6b5b4b] uppercase tracking-widest">
                        Terakhir diperbarui {updatedAtFormatted}
                      </p>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <JourneyTrack activeStep={activeStep} />
              </div>

              {order.status === "PENDING_PAYMENT" && (
                <PaymentAction orderCode={order.orderCode} />
              )}

              {(order.status === "SHIPPED" || order.status === "COMPLETED") &&
                order.trackingNumber && (
                  <TrackingInfo
                    status={order.status}
                    courier={order.courier}
                    trackingNumber={order.trackingNumber}
                    onCopy={copyTracking}
                  />
                )}
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 gap-4 md:gap-6">
              <OrderCodeCard orderCode={order.orderCode} />
              <SummaryStats
                createdAt={order.createdAt}
                totalAmount={order.totalAmount}
              />
              <DeliveryInfo />
            </div>
          </div>
        </section>
      )}

      {!order && !loading && (
        <section className="pb-32 px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-16 h-px bg-[#e8dcc8] mb-12" />
          <p className="text-[#6b5b4b] font-medium max-w-md leading-relaxed mb-10 text-[16px] md:text-[18px]">
            Sudah punya dTeman tapi belum dilacak? Masukkan kode pesanan Anda di
            atas untuk melihat status terbaru.
          </p>
          <Link
            href="/products"
            className="group inline-flex items-center gap-4 px-10 py-5 rounded-full bg-[#2d241c] text-white font-black text-[15px] uppercase tracking-widest hover:bg-[#c85a2d] transition-all shadow-lift-sm"
          >
            <span>Mulai Belanja</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      )}
    </div>
  );
}
