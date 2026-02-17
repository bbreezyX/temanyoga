"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  Shirt,
  ShieldCheck,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import type { OrderStatusResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STEPS = [
  { status: "PENDING_PAYMENT", label: "Pesanan Dibuat", sub: "Menunggu pembayaran", icon: Clock },
  { status: "AWAITING_VERIFICATION", label: "Verifikasi", sub: "Bukti sedang dicek", icon: ShieldCheck },
  { status: "PAID", label: "Dibayar", sub: "Pembayaran diverifikasi", icon: CreditCard },
  { status: "PROCESSING", label: "Diproses", sub: "Produk sedang disiapkan", icon: Shirt },
  { status: "SHIPPED", label: "Dikirim", sub: "Pesanan dalam perjalanan", icon: Truck },
  { status: "COMPLETED", label: "Selesai", sub: "Pesanan telah diterima", icon: CheckCircle2 },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const initialCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async (orderCode: string) => {
    if (!orderCode.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await apiFetch<OrderStatusResponse>(
      `/api/orders/${orderCode.trim()}/status`,
    );
    setLoading(false);
    if (!res.success) {
      setError(
        res.error || "Pesanan tidak ditemukan. Periksa kembali kode Anda.",
      );
      return;
    }
    setOrder(res.data);
  }, []);

  useEffect(() => {
    if (initialCode) {
      const timer = setTimeout(() => {
        fetchOrder(initialCode);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialCode, fetchOrder]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOrder(code);
  }

  const getActiveStepIndex = (status: OrderStatus) => {
    const index = STEPS.findIndex((s) => s.status === status);
    if (index === -1 && status === "CANCELLED") return -1;
    // Special case for PAID which might show as PROCESSING
    if (status === "PAID") return 2;
    if (status === "PROCESSING") return 3;
    return index;
  };

  const activeStep = getActiveStepIndex(
    order?.status ?? ("PENDING_PAYMENT" as OrderStatus),
  );

  function copyTracking(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Nomor resi berhasil disalin!");
  }

  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans selection:bg-[#c85a2d] selection:text-white">
      {/* 
        HERO SEARCH SECTION 
        Signature: Dramatic scale, overlapping elements, and animated mesh
      */}
      <section className="relative pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="relative min-h-[50svh] flex flex-col items-center justify-center py-16 px-6 md:px-16 rounded-[40px] md:rounded-[64px] bg-white overflow-hidden shadow-soft ring-1 ring-[#e8dcc8]/50 animate-floatIn">
          {/* Background Animated Blobs */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-[#c85a2d]/10 to-[#7a9d7f]/5 blur-[80px] animate-gradient bg-[length:200%_200%]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-[#7a9d7f]/10 to-[#c85a2d]/5 blur-[80px] animate-gradient bg-[length:200%_200%] delay-1000"></div>

          <div className="relative z-10 w-full max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#c85a2d] animate-pulse"></span>
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                Status Pesanan Anda
              </span>
            </div>

            <h1 className="font-display text-[48px] md:text-[72px] leading-[0.95] tracking-[-0.04em] font-black text-slate-900 mb-8">
              Lacak Pesanan
            </h1>

            <p className="text-[16px] md:text-[18px] text-slate-500 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
              Masukkan kode pesanan Anda untuk melihat status pengiriman secara real-time.
            </p>

            <div className="relative max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Masukkan Kode Pesanan"
                  className="w-full h-[80px] rounded-[32px] bg-white px-10 pr-20 text-xl font-display font-black text-slate-900 ring-2 ring-slate-100 focus:ring-[#c85a2d] focus:outline-none shadow-soft transition-all placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="absolute right-3 top-3 h-[56px] px-8 rounded-[24px] bg-[#c85a2d] text-white font-black flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden md:inline">Lacak</span>
                      <Search className="w-6 h-6" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="mt-8 p-4 rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 font-bold text-sm inline-flex items-center gap-2 animate-floatIn">
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        ORDER STATUS CONTENT 
      */}
      {order && (
        <section className="pb-32 px-4 md:px-8 max-w-7xl mx-auto animate-floatIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Journey Progress (7 cols) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="rounded-[48px] bg-white p-8 md:p-12 shadow-soft ring-1 ring-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7a9d7f]/5 blur-3xl -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">
                      Status Pesanan
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#7a9d7f]"></div>
                      <span className="text-sm font-bold text-slate-400">
                        Terakhir diperbarui{" "}
                        {new Date(order.updatedAt).toLocaleDateString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest ring-1",
                      order.status === "COMPLETED"
                        ? "bg-[#7a9d7f]/10 text-[#7a9d7f] ring-[#7a9d7f]/20"
                        : order.status === "CANCELLED"
                          ? "bg-red-50 text-red-600 ring-red-100"
                          : "bg-[#c85a2d]/10 text-[#c85a2d] ring-[#c85a2d]/20",
                    )}
                  >
                    {order.status.replace(/_/g, " ")}
                  </div>
                </div>

                {/* Journey Track */}
                <div className="relative">
                  <div className="hidden md:block absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-slate-100 z-0">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#c85a2d] transition-all duration-1000 ease-out"
                      style={{
                        width: `${(Math.max(0, activeStep) / (STEPS.length - 1)) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4 relative z-10">
                    {STEPS.map((step, i) => {
                      const isCompleted = i <= activeStep;
                      const isPast = i < activeStep;
                      const isActive = i === activeStep;
                      const Icon = step.icon;

                      return (
                        <div
                          key={i}
                          className="flex md:flex-col items-center md:items-center gap-5 md:gap-4 group relative"
                        >
                          {/* Vertical connector for mobile */}
                          {i < STEPS.length - 1 && (
                            <div className="md:hidden absolute left-[28px] top-[56px] w-[2px] h-[calc(100%-40px)] bg-slate-100 -z-10">
                              <div
                                className={cn(
                                  "w-full h-full bg-[#c85a2d] transition-all duration-700 origin-top",
                                  isPast ? "scale-y-100" : "scale-y-0"
                                )}
                              />
                            </div>
                          )}

                          <div
                            className={cn(
                              "w-14 h-14 md:w-16 md:h-16 rounded-[var(--rounded-organic-1)] flex items-center justify-center transition-all duration-500 shadow-sm z-10",
                              isCompleted
                                ? "bg-[#c85a2d] text-white rotate-6 shadow-lg shadow-[#c85a2d]/20"
                                : "bg-slate-50 text-slate-300 ring-1 ring-slate-100",
                              isActive && "ring-4 ring-[#c85a2d]/20 scale-110 md:scale-125",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-6 h-6 md:w-8 md:h-8",
                                isActive && "animate-pulse",
                              )}
                            />
                          </div>
                          <div className="text-left md:text-center flex flex-col pt-1">
                            <span
                              className={cn(
                                "text-sm md:text-[15px] font-black leading-tight transition-colors",
                                isCompleted
                                  ? "text-slate-900"
                                  : "text-slate-300",
                              )}
                            >
                              {step.label}
                            </span>
                            <span className={cn(
                              "text-[10px] md:text-[11px] font-bold uppercase tracking-wider mt-1",
                              isActive ? "text-[#c85a2d] animate-pulse" : "text-slate-400 opacity-60"
                            )}>
                              {step.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Special Action: Payment Progress */}
              {order.status === "PENDING_PAYMENT" && (
                <div className="rounded-[40px] bg-[#fdf8f6] p-8 md:p-10 ring-1 ring-[#c85a2d]/10 flex flex-col md:flex-row items-center justify-between gap-8 animate-floatIn">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-sm ring-1 ring-[#c85a2d]/10 grid place-items-center shrink-0">
                      <CreditCard className="w-8 h-8 text-[#c85a2d]" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-black tracking-tight mb-1">
                        Selesaikan Pembayaran
                      </h3>
                      <p className="text-slate-500 font-medium text-sm">
                        Transfer Anda dinanti untuk mulai menyiapkan
                        &apos;dTeman&apos; pilihan Anda.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/checkout/success?code=${order.orderCode}&total=${order.totalAmount}`}
                    className="group relative inline-flex items-center justify-center gap-3 min-h-[56px] px-8 rounded-full bg-[#c85a2d] text-white font-black overflow-hidden shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span className="relative z-10">
                      Upload Bukti Transaksi
                    </span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Courier & Tracking (if SHIPPED or COMPLETED) */}
              {(order.status === "SHIPPED" || order.status === "COMPLETED") &&
                order.trackingNumber && (
                  <div className="rounded-[48px] bg-slate-900 p-8 md:p-12 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#c85a2d]/20 blur-[100px] -mr-40 -mt-40 transition-transform group-hover:scale-125 duration-1000"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[var(--rounded-organic-2)] bg-white/10 backdrop-blur-md grid place-items-center shrink-0 ring-1 ring-white/20">
                          <Package className="w-10 h-10 text-[#c85a2d]" />
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-[#c85a2d] font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                            Informasi Pengiriman
                          </p>
                          <h3 className="text-3xl font-black tracking-tight mb-2 opacity-95">
                            {order.status === "COMPLETED"
                              ? "Pesanan Tiba!"
                              : "Paket Dikirim"}
                          </h3>
                          <p className="text-slate-400 font-medium max-w-xs">
                            {order.courier || "Ekspedisi"} — Pesanan Anda sedang diproses oleh pihak kurir.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 ring-1 ring-white/10 w-full md:w-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                          Nomor Resi
                        </p>
                        <div className="flex items-center gap-4">
                          <code className="text-2xl font-mono font-black tracking-tighter">
                            {order.trackingNumber}
                          </code>
                          <button
                            onClick={() => copyTracking(order.trackingNumber!)}
                            className="w-10 h-10 rounded-full bg-white text-slate-900 grid place-items-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                          >
                            <ClipboardCheck className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Bento Sidebar Details (4 cols) */}
            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              {/* Order Code Card */}
              <div className="rounded-[40px] bg-white p-8 shadow-soft ring-1 ring-slate-100 flex flex-col justify-between group hover:shadow-lift transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#c85a2d] text-white grid place-items-center rotate-3 group-hover:rotate-6 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Order Identity
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                    Kode Pesanan
                  </h3>
                  <p className="text-3xl font-mono font-black tracking-tight text-slate-900 group-hover:text-[#c85a2d] transition-colors">
                    {order.orderCode}
                  </p>
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[40px] bg-[#7a9d7f]/5 p-6 ring-1 ring-[#7a9d7f]/20">
                  <Calendar className="w-6 h-6 text-[#7a9d7f] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7a9d7f] mb-1">
                    Tanggal
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-[40px] bg-[#c85a2d]/5 p-6 ring-1 ring-[#c85a2d]/20">
                  <Package className="w-6 h-6 text-[#c85a2d] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#c85a2d] mb-1">
                    Total
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Delivery Disclaimer */}
              <div className="rounded-[40px] bg-white p-8 shadow-soft ring-1 ring-slate-100 relative group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-base font-black tracking-tight">
                      Informasi Pengiriman
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Kami berusaha mengirimkan pesanan Anda secepat mungkin. Proses verifikasi biasanya memakan waktu maksimal 1x24 jam.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 text-xs font-black text-[#c85a2d] hover:gap-3 transition-all uppercase tracking-widest"
                    >
                      Lihat Produk Lain <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CALL TO ACTION */}
      {!order && !loading && (
        <section className="pb-32 px-4 md:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="w-16 h-[2px] bg-[#e8dcc8] mb-12"></div>
          <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8">
            Belum memiliki pesanan? Temukan koleksi boneka rajut terbaru kami hari ini.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-white hover:border-[#c85a2d] hover:text-[#c85a2d] transition-all"
          >
            Mulai Belanja Sekarang
          </Link>
        </section>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-lift ring-1 ring-[#e8dcc8] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#c85a2d]" />
            </div>
            <div className="absolute -inset-4 bg-[#c85a2d]/10 blur-2xl -z-10 rounded-full animate-pulse"></div>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
