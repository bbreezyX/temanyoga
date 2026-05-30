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
  Check,
  Clock,
  ShieldCheck,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma";
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

const StatusFlow = memo(function StatusFlow({
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
      {/* Desktop horizontal progress line (behind nodes) */}
      <div className="absolute left-[8.333%] right-[8.333%] top-7 hidden h-0.5 bg-black/10 md:block">
        <div
          className="h-full bg-ink transition-[width] duration-500 ease-out will-change-[width]"
          style={{ width: progressWidth }}
        />
      </div>

      <ol className="grid grid-cols-1 gap-0 md:grid-cols-6 md:gap-2">
        {STEP_CONFIG.map((step, i) => {
          const Icon = STEP_ICONS[step.status as keyof typeof STEP_ICONS];
          const done = i < activeStep;
          const active = i === activeStep;
          const isLast = i === STEP_CONFIG.length - 1;

          return (
            <li
              key={step.status}
              className="relative flex items-center gap-4 pb-7 last:pb-0 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center"
            >
              {/* Mobile-only vertical connector */}
              {!isLast && (
                <span className="absolute left-[27px] top-[56px] h-[calc(100%-56px)] w-0.5 bg-black/10 md:hidden">
                  <span
                    className={cn(
                      "block h-full w-full origin-top bg-action transition-transform duration-500",
                      done ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                </span>
              )}

              <div
                className={cn(
                  "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
                  done
                    ? "bg-ink text-white"
                    : "border border-black/10 bg-paper text-ink/40",
                  active &&
                    "border-none bg-action text-white shadow-lg shadow-action/30 ring-4 ring-action/15 md:scale-110",
                )}
              >
                {done ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>

              <div className="md:mt-1">
                <p
                  className={cn(
                    "text-sm font-bold leading-tight tracking-tight",
                    done ? "text-ink" : "text-ink/40",
                    active && "text-action",
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] font-medium leading-tight",
                    active ? "text-ink-soft" : "text-ink/40",
                  )}
                >
                  {step.sub}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
});

const OrderStatusBadge = memo(function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const displayStatus = status.replace(/_/g, " ");

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest sm:text-[13px]",
        status === "COMPLETED"
          ? "border-sage/20 bg-sage/10 text-sage"
          : status === "CANCELLED"
            ? "border-red-100 bg-red-50 text-red-600"
            : "border-action/20 bg-action/10 text-action",
      )}
    >
      {displayStatus}
    </div>
  );
});

const OrderCodeCard = memo(function OrderCodeCard({
  orderCode,
}: {
  orderCode: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-[32px] border border-black/5 bg-paper p-7 transition-colors hover:border-action/40">
      <div className="min-w-0">
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Kode Pesanan
        </h3>
        <p className="break-all font-mono text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-action sm:text-3xl">
          {orderCode}
        </p>
      </div>
      <div className="flex h-12 w-12 shrink-0 rotate-3 items-center justify-center rounded-2xl bg-action text-white shadow-sm transition-transform group-hover:rotate-6">
        <Sparkles className="h-6 w-6" />
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
      <div className="rounded-[24px] border border-black/5 bg-paper p-5 sm:p-6">
        <Calendar className="mb-4 h-6 w-6 text-sage" />
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Tanggal
        </p>
        <p className="text-sm font-bold text-ink">{formattedDate}</p>
      </div>
      <div className="rounded-[24px] border border-black/5 bg-paper p-5 sm:p-6">
        <Package className="mb-4 h-6 w-6 text-action" />
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Total
        </p>
        <p className="text-sm font-bold text-action">
          {formatCurrency(totalAmount)}
        </p>
      </div>
    </div>
  );
});

const DeliveryInfo = memo(function DeliveryInfo() {
  return (
    <div className="rounded-[32px] border border-black/5 bg-paper p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-oat">
          <MapPin className="h-5 w-5 text-ink/50" />
        </div>
        <div className="space-y-4">
          <h4 className="text-base font-bold tracking-tight text-ink">
            Informasi Produksi
          </h4>
          <p className="text-[13px] font-medium leading-relaxed text-ink-soft">
            Setiap produk dTeman dibuat secara manual dengan cinta. Proses
            handmade membutuhkan waktu ±3 minggu sebelum siap dikirim ke rumah
            Anda.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-action transition-all hover:gap-3"
          >
            Kembali Berbelanja <ArrowRight className="h-3 w-3" />
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
    <div className="flex flex-col items-center justify-between gap-8 rounded-[40px] border border-action/30 bg-paper p-8 animate-floatIn md:flex-row md:p-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-action/10 text-action">
          <CreditCard className="h-8 w-8" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="mb-2 text-xl font-bold tracking-tight text-ink">
            Selesaikan Pembayaran
          </h3>
          <p className="text-sm font-medium text-ink-soft">
            Transfer Anda dinanti untuk mulai menyiapkan dTeman pilihan Anda.
          </p>
        </div>
      </div>
      <Link
        href={`/checkout/success/${orderCode}`}
        className="group inline-flex h-14 w-full shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-action px-8 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-110 md:w-auto"
      >
        <span>Upload Bukti Bayar</span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
    <div className="relative overflow-hidden rounded-[40px] bg-ink p-8 text-white sm:p-10">
      <div className="pointer-events-none absolute right-0 top-0 -mr-32 -mt-32 h-72 w-72 bg-action/20 blur-[80px]" />
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm">
            <Package className="h-8 w-8 text-action" />
          </div>
          <div>
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-action">
              Informasi Pengiriman
            </p>
            <h3 className="mb-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              {status === "COMPLETED" ? "Pesanan Tiba!" : "Paket Dikirim"}
            </h3>
            <p className="text-sm font-medium text-white/60">
              <span className="font-bold text-white">
                {courier || "Ekspedisi"}
              </span>{" "}
              — diproses oleh kurir terpercaya kami.
            </p>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            Nomor Resi
          </p>
          <div className="flex items-center justify-between gap-4">
            <code className="break-all font-mono text-xl font-bold tracking-tight text-action sm:text-2xl">
              {trackingNumber}
            </code>
            <button
              onClick={() => onCopy(trackingNumber)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-all hover:bg-action hover:text-white"
              aria-label="Salin nomor resi"
            >
              <ClipboardCheck className="h-5 w-5" />
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
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-ink selection:bg-action selection:text-white overflow-x-hidden md:-mt-24 md:pt-24">
      {/* ─────────────────────  SEARCH HERO  ──────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:px-8 sm:pt-14 md:pt-16 md:pb-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-paper px-5 py-2 shadow-sm">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-action" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-action sm:text-[11px]">
            D`Teman Order Tracking
          </span>
        </span>

        <h1 className="mt-6 font-bungee text-[clamp(2.25rem,9vw,5rem)] leading-[0.95] text-ink">
          Jejak Pesanan
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base md:text-lg">
          Pantau perjalanan produk handmade Anda secara real-time. Masukkan kode
          pesanan untuk melihat detail status terbaru.
        </p>

        <form onSubmit={handleSubmit} className="relative mx-auto mt-8 sm:mt-10">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: ORD-2024..."
            aria-label="Kode pesanan"
            className="h-16 w-full rounded-full border border-black/10 bg-paper pl-6 pr-28 text-base font-semibold text-ink shadow-sm transition-all placeholder:text-ink/40 focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15 sm:h-20 sm:pl-8 sm:pr-44 sm:text-xl"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="absolute right-2 top-1/2 inline-flex h-12 -translate-y-1/2 items-center justify-center gap-2 rounded-full bg-ink px-5 text-white transition-all hover:bg-action active:scale-95 disabled:opacity-30 sm:right-3 sm:h-14 sm:px-8"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
            ) : (
              <>
                <span className="hidden text-sm font-semibold uppercase tracking-widest sm:inline">
                  Lacak
                </span>
                <Search className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 animate-floatIn">
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* ─────────────  ORDER DETAIL (single column timeline)  ────── */}
      {order && (
        <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8 md:pb-32 animate-floatIn">
          {/* Status flow */}
          <div className="rounded-[40px] border border-black/5 bg-paper p-6 sm:p-9 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-ink">
                  Status Pesanan
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
                  <p className="text-[13px] font-semibold text-ink-soft">
                    Terakhir diperbarui {updatedAtFormatted}
                  </p>
                </div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {order.status === "CANCELLED" ? (
              <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-600">
                  Pesanan ini telah dibatalkan.
                </p>
              </div>
            ) : (
              <StatusFlow activeStep={activeStep} />
            )}
          </div>

          {/* Contextual action / tracking */}
          {order.status === "PENDING_PAYMENT" && (
            <div className="mt-6">
              <PaymentAction orderCode={order.orderCode} />
            </div>
          )}

          {(order.status === "SHIPPED" || order.status === "COMPLETED") &&
            order.trackingNumber && (
              <div className="mt-6">
                <TrackingInfo
                  status={order.status}
                  courier={order.courier}
                  trackingNumber={order.trackingNumber}
                  onCopy={copyTracking}
                />
              </div>
            )}

          {/* Order info cards */}
          <div className="mt-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <OrderCodeCard orderCode={order.orderCode} />
              <SummaryStats
                createdAt={order.createdAt}
                totalAmount={order.totalAmount}
              />
            </div>
            <DeliveryInfo />
          </div>
        </section>
      )}

      {/* ─────────────────────  EMPTY STATE  ──────────────────────── */}
      {!order && !loading && (
        <section className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-28 text-center sm:px-8">
          <div className="mb-10 h-px w-16 bg-black/10" />
          <p className="mb-10 max-w-md text-base font-medium leading-relaxed text-ink-soft md:text-lg">
            Sudah punya dTeman tapi belum dilacak? Masukkan kode pesanan Anda di
            atas untuk melihat status terbaru.
          </p>
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-action"
          >
            <span>Mulai Belanja</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      )}
    </div>
  );
}
