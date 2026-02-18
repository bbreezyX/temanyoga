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
        <div className="md:hidden absolute left-[28px] top-[56px] w-[2px] h-[calc(100%-40px)] bg-slate-100 -z-10">
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
          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 shadow-sm z-10 will-change-transform",
          isCompleted
            ? "bg-[#c85a2d] text-white rotate-6 shadow-md shadow-[#c85a2d]/15"
            : "bg-slate-50 text-slate-300 ring-1 ring-slate-100",
          isActive && "ring-4 ring-[#c85a2d]/20 scale-110 md:scale-125",
        )}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      <div className="text-left md:text-center flex flex-col pt-1">
        <span
          className={cn(
            "text-sm md:text-[15px] font-black leading-tight",
            isCompleted ? "text-slate-900" : "text-slate-300",
          )}
        >
          {step.label}
        </span>
        <span
          className={cn(
            "text-[10px] md:text-[11px] font-bold uppercase tracking-wider mt-1",
            isActive ? "text-[#c85a2d]" : "text-slate-400 opacity-60",
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
        "px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest ring-1",
        status === "COMPLETED"
          ? "bg-[#7a9d7f]/10 text-[#7a9d7f] ring-[#7a9d7f]/20"
          : status === "CANCELLED"
            ? "bg-red-50 text-red-600 ring-red-100"
            : "bg-[#c85a2d]/10 text-[#c85a2d] ring-[#c85a2d]/20",
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
      <div className="hidden md:block absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-slate-100 z-0">
        <div
          className="absolute top-0 left-0 h-full bg-[#c85a2d] transition-[width] duration-500 ease-out will-change-[width]"
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
    <div className="rounded-[32px] md:rounded-[40px] bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between group hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#c85a2d] text-white grid place-items-center rotate-3 group-hover:rotate-6 transition-transform">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Informasi Pesanan
        </span>
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
          Kode Pesanan
        </h3>
        <p className="text-xl md:text-3xl font-mono font-black tracking-tight text-slate-900 group-hover:text-[#c85a2d] transition-colors">
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

  const formattedTotal = useMemo(
    () => formatCurrency(totalAmount),
    [totalAmount],
  );

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <div className="rounded-[28px] md:rounded-[40px] bg-[#7a9d7f]/5 p-4 md:p-6 ring-1 ring-[#7a9d7f]/20">
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#7a9d7f] mb-3 md:mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7a9d7f] mb-1">
          Tanggal
        </p>
        <p className="text-xs md:text-sm font-black text-slate-900">
          {formattedDate}
        </p>
      </div>
      <div className="rounded-[28px] md:rounded-[40px] bg-[#c85a2d]/5 p-4 md:p-6 ring-1 ring-[#c85a2d]/20">
        <Package className="w-5 h-5 md:w-6 md:h-6 text-[#c85a2d] mb-3 md:mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#c85a2d] mb-1">
          Total
        </p>
        <p className="text-xs md:text-sm font-black text-slate-900">
          {formattedTotal}
        </p>
      </div>
    </div>
  );
});

const DeliveryInfo = memo(function DeliveryInfo() {
  return (
    <div className="rounded-[28px] md:rounded-[40px] bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100 relative group">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
        </div>
        <div className="space-y-3 md:space-y-4">
          <h4 className="text-sm md:text-base font-black tracking-tight">
            Informasi Pengiriman
          </h4>
          <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
            Kami berusaha mengirimkan pesanan Anda secepat mungkin. Proses
            verifikasi biasanya memakan waktu maksimal 1x24 jam.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[11px] md:text-xs font-black text-[#c85a2d] hover:gap-3 transition-all uppercase tracking-widest"
          >
            Lihat Produk Lain <ArrowRight className="w-3 h-3" />
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
    <div className="rounded-[28px] md:rounded-[40px] bg-[#fdf8f6] p-6 md:p-10 ring-1 ring-[#c85a2d]/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white shadow-sm ring-1 ring-[#c85a2d]/10 grid place-items-center shrink-0">
          <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-[#c85a2d]" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-lg md:text-xl font-black tracking-tight mb-1">
            Selesaikan Pembayaran
          </h3>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            Transfer Anda dinanti untuk mulai menyiapkan dTeman pilihan Anda.
          </p>
        </div>
      </div>
      <Link
        href={`/checkout/success/${orderCode}`}
        className="group relative inline-flex items-center justify-center gap-3 min-h-[48px] md:min-h-[56px] px-6 md:px-8 rounded-full bg-[#c85a2d] text-white font-black overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
      >
        <span className="relative z-10 text-sm md:text-base">
          Upload Bukti Transaksi
        </span>
        <ArrowRight className="relative z-10 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
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
    <div className="rounded-[32px] md:rounded-[48px] bg-slate-900 p-6 md:p-12 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 md:w-80 md:h-80 bg-[#c85a2d]/10 blur-[40px] md:blur-[60px] -mr-24 md:-mr-40 -mt-24 md:-mt-40 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/10 grid place-items-center shrink-0 ring-1 ring-white/20">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-[#c85a2d]" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[#c85a2d] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-[10px] mb-1 md:mb-2">
              Informasi Pengiriman
            </p>
            <h3 className="text-xl md:text-3xl font-black tracking-tight mb-1 md:mb-2 opacity-95">
              {status === "COMPLETED" ? "Pesanan Tiba!" : "Paket Dikirim"}
            </h3>
            <p className="text-slate-400 font-medium text-xs md:text-sm max-w-xs">
              {courier || "Ekspedisi"} - Pesanan Anda sedang diproses oleh pihak
              kurir.
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl md:rounded-[32px] p-4 md:p-6 ring-1 ring-white/10 w-full md:w-auto text-center md:text-left">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">
            Nomor Resi
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
            <code className="text-lg md:text-2xl font-mono font-black tracking-tighter">
              {trackingNumber}
            </code>
            <button
              onClick={() => onCopy(trackingNumber)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-slate-900 grid place-items-center hover:scale-110 active:scale-95 transition-transform shadow-md"
              aria-label="Salin nomor resi"
            >
              <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5" />
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

  useEffect(() => {
    if (!initialCode?.trim()) return;

    let mounted = true;

    const performFetch = async () => {
      // access explicit api route
      const res = await apiFetch<OrderStatusResponse>(
        `/api/orders/${initialCode.trim()}/status`,
      );

      if (!mounted) return;

      setLoading(false);

      if (!res.success) {
        setError(
          res.error || "Pesanan tidak ditemukan. Periksa kembali kode Anda.",
        );
        return;
      }
      setOrder(res.data);
    };

    performFetch();

    return () => {
      mounted = false;
    };
  }, [initialCode]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!code.trim()) return;
      router.push(`/track-order/${code.trim()}`);
    },
    [code, router],
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
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans selection:bg-[#c85a2d] selection:text-white">
      <section className="relative pt-4 md:pt-6 pb-8 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="relative min-h-[45svh] md:min-h-[50svh] flex flex-col items-center justify-center py-10 md:py-16 px-4 md:px-16 rounded-[28px] md:rounded-[64px] bg-white overflow-hidden shadow-sm ring-1 ring-[#e8dcc8]/50">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] md:w-[50%] aspect-square rounded-full bg-gradient-to-br from-[#c85a2d]/5 to-[#7a9d7f]/3 pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] md:w-[40%] aspect-square rounded-full bg-gradient-to-tr from-[#7a9d7f]/5 to-[#c85a2d]/3 pointer-events-none" />

          <div className="relative z-10 w-full max-w-xl md:max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 mb-6 md:mb-8">
              <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#c85a2d]" />
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#c85a2d]">
                Status Pesanan Anda
              </span>
            </div>

            <h1 className="font-display text-[36px] md:text-[72px] leading-[0.95] tracking-[-0.03em] md:tracking-[-0.04em] font-black text-slate-900 mb-4 md:mb-8">
              Lacak Pesanan
            </h1>

            <p className="text-[14px] md:text-[18px] text-slate-500 mb-8 md:mb-12 max-w-sm md:max-w-xl mx-auto font-medium leading-relaxed">
              Masukkan kode pesanan Anda untuk melihat status pengiriman secara
              real-time.
            </p>

            <div className="relative max-w-md md:max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Masukkan Kode Pesanan"
                  className="w-full h-[64px] md:h-[80px] rounded-[24px] md:rounded-[32px] bg-white px-6 md:px-10 pr-20 md:pr-24 text-base md:text-xl font-display font-black text-slate-900 ring-2 ring-slate-100 focus:ring-[#c85a2d] focus:outline-none shadow-sm transition-all placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="absolute right-2 md:right-3 top-2 md:top-3 h-[48px] md:h-[56px] px-6 md:px-8 rounded-[20px] md:rounded-[24px] bg-[#c85a2d] text-white font-black flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden md:inline">Lacak</span>
                      <Search className="w-5 h-5 md:w-6 md:h-6" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="mt-6 md:mt-8 p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 font-bold text-xs md:text-sm inline-flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {order && (
        <section className="pb-20 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto animate-floatIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <div className="rounded-[32px] md:rounded-[48px] bg-white p-6 md:p-12 shadow-sm ring-1 ring-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-[#7a9d7f]/5 blur-xl md:blur-2xl -mr-20 md:-mr-32 -mt-20 md:-mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10 md:mb-16">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1 md:mb-2">
                      Status Pesanan
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#7a9d7f]" />
                      <span className="text-xs md:text-sm font-bold text-slate-400">
                        Terakhir diperbarui {updatedAtFormatted}
                      </span>
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
        <section className="pb-20 md:pb-32 px-4 md:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="w-12 md:w-16 h-[2px] bg-[#e8dcc8] mb-8 md:mb-12" />
          <p className="text-slate-400 font-medium max-w-xs md:max-w-sm leading-relaxed mb-6 md:mb-8 text-sm md:text-base">
            Belum memiliki pesanan? Temukan koleksi boneka rajut terbaru kami
            hari ini.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-white hover:border-[#c85a2d] hover:text-[#c85a2d] transition-all text-sm md:text-base"
          >
            Mulai Belanja Sekarang
          </Link>
        </section>
      )}
    </div>
  );
}
