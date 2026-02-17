"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import {
  ChevronLeft,
  ShieldCheck,
  ClipboardList,
  User,
  ArrowRight,
  MapPin,
  Loader2,
  Ticket,
  X,
  Check,
  Clock,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { apiFetch, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import type {
  CreateOrderResponse,
  ShippingZone,
  CouponValidationResult,
} from "@/types/api";

const checkoutFormSchema = z.object({
  customerName: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter"),
  customerEmail: z.string().email("Format email tidak valid").max(200, "Email maksimal 200 karakter"),
  customerPhone: z.string().min(1, "Nomor WhatsApp wajib diisi").max(30, "Nomor maksimal 30 karakter"),
  address: z.string().min(1, "Alamat wajib diisi").max(500, "Alamat maksimal 500 karakter"),
  city: z.string().min(1, "Kota wajib diisi").max(100, "Kota maksimal 100 karakter"),
  zip: z.string().min(1, "Kode pos wajib diisi").max(20, "Kode pos maksimal 20 karakter"),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart, getItemKey } = useCart();
  const toast = useToast();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;
  const shippingCost = selectedZone?.price ?? 0;

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "PERCENTAGE"
      ? Math.floor((cartTotal * appliedCoupon.discountValue) / 100)
      : Math.min(appliedCoupon.discountValue, cartTotal)
    : 0;
  const totalAmount = cartTotal - discountAmount + shippingCost;

  const orderPlaced = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    async function loadZones() {
      const res = await apiFetch<ShippingZone[]>("/api/shipping-zones");
      if (res.success) {
        setZones(res.data);
      }
      setZonesLoading(false);
    }
    loadZones();
  }, []);

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);

    const res = await apiPost<CouponValidationResult>("/api/coupons/validate", {
      code,
    });
    setCouponLoading(false);

    if (!res.success) {
      setCouponError(res.error);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(res.data);
    setCouponCode(res.data.code);
    toast.success("Kupon berhasil diterapkan!");
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!selectedZoneId) {
      toast.error("Mohon pilih zona pengiriman.");
      return;
    }

    const shippingAddress = `${data.address}, ${data.city}, ${data.zip}`;

    const res = await apiPost<CreateOrderResponse>("/api/orders", {
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone.trim(),
      shippingAddress,
      shippingZoneId: selectedZoneId,
      notes: data.notes?.trim() || undefined,
      couponCode: appliedCoupon?.code || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        accessoryIds: (i.accessories || []).map((a) => a.id),
      })),
    });

    if (!res.success) {
      toast.error(res.error || "Gagal membuat pesanan");
      return;
    }

    orderPlaced.current = true;
    clearCart();
    window.scrollTo(0, 0);

    sessionStorage.setItem(`checkout_email_${res.data.orderCode}`, data.customerEmail);

    router.push(`/checkout/success/${res.data.orderCode}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans">
      <main
        className="flex-1 overflow-y-auto px-6 md:px-8 pb-16 w-full max-w-6xl mx-auto"
        id="top"
      >
        <section className="pt-8 md:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="relative overflow-hidden rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] px-8 py-10 animate-floatIn">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#c85a2d]/5 blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#7a9d7f]/5 blur-2xl pointer-events-none"></div>

                <div className="relative">
                  <div className="flex flex-col gap-5 mb-10">
                    <Link
                      href="/cart"
                      className="group inline-flex items-center gap-2 self-start text-[13px] font-bold text-[#c85a2d] hover:opacity-70 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span>Kembali ke Keranjang</span>
                    </Link>

                    <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#c85a2d]/10 to-[#d46a3a]/10 ring-1 ring-[#c85a2d]/20 px-4 py-2 self-start">
                      <span className="grid place-items-center w-5 h-5 rounded-full bg-[#c85a2d] text-white shadow-sm">
                        <ClipboardList className="w-3 h-3" />
                      </span>
                      <p className="text-[11px] font-bold text-[#7a4a33] uppercase tracking-widest">
                        Langkah 1 dari 3
                      </p>
                    </div>
                  </div>

                  <h1 className="font-display text-[28px] md:text-[40px] leading-[1.1] tracking-tight font-black text-slate-900">
                    Data Pengiriman
                  </h1>
                  <p className="mt-3 text-[15px] md:text-[16px] text-[#6b5b4b] leading-relaxed">
                    Beritahu kami kemana pesanan harus dikirim. Pastikan data
                    sudah benar untuk kelancaran pengiriman.
                  </p>

                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-3 px-0.5">
                      <p className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-widest">
                        Progres Checkout
                      </p>
                      <p className="text-[11px] font-bold text-[#c85a2d] tracking-wider">
                        33% Selesai
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#c85a2d] to-[#d46a3a] shadow-sm transition-all duration-500"></div>
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#c85a2d] text-white grid place-items-center shadow-lg shadow-[#c85a2d]/30">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-[#c85a2d] uppercase tracking-wider text-center">
                          Alamat
                        </span>
                      </div>
                      <div className="flex-1 h-0.5 bg-[#e8dcc8] -mt-6"></div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#f5f1ed] ring-2 ring-[#e8dcc8] text-[#b7a894] grid place-items-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-[#b7a894] uppercase tracking-wider text-center">
                          Bayar
                        </span>
                      </div>
                      <div className="flex-1 h-0.5 bg-[#e8dcc8] -mt-6"></div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#f5f1ed] ring-2 ring-[#e8dcc8] text-[#b7a894] grid place-items-center">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-[#b7a894] uppercase tracking-wider text-center">
                          Selesai
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center shrink-0">
                      <User className="w-6 h-6 text-[#c85a2d]" />
                    </div>
                    <div>
                      <h2 className="font-display font-black tracking-tight text-[20px] text-slate-900">
                        Informasi Penerima
                      </h2>
                      <p className="text-[14px] text-[#6b5b4b]">
                        Detail untuk pengiriman dan update pesanan.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <label
                        htmlFor="customerName"
                        className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                      >
                        Nama Lengkap
                      </label>
                      <input
                        id="customerName"
                        {...register("customerName")}
                        placeholder="Contoh: Nadya Putri"
                        className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                      />
                      {errors.customerName && (
                        <p className="text-xs text-red-500 font-medium">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <label
                          htmlFor="customerEmail"
                          className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                        >
                          Email
                        </label>
                        <input
                          id="customerEmail"
                          type="email"
                          {...register("customerEmail")}
                          placeholder="nadya@email.com"
                          className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                        />
                        {errors.customerEmail && (
                          <p className="text-xs text-red-500 font-medium">{errors.customerEmail.message}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="customerPhone"
                          className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                        >
                          Nomor WhatsApp
                        </label>
                        <input
                          id="customerPhone"
                          type="tel"
                          {...register("customerPhone")}
                          placeholder="0812345678..."
                          className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-red-500 font-medium">{errors.customerPhone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="address"
                        className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                      >
                        Alamat Lengkap
                      </label>
                      <input
                        id="address"
                        {...register("address")}
                        placeholder="Nama jalan, nomor rumah, RT/RW, Kompleks/Cluster"
                        className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <label
                          htmlFor="city"
                          className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                        >
                          Kota / Kabupaten
                        </label>
                        <input
                          id="city"
                          {...register("city")}
                          placeholder="Contoh: Bandung"
                          className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                        />
                        {errors.city && (
                          <p className="text-xs text-red-500 font-medium">{errors.city.message}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="zip"
                          className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                        >
                          Kode Pos
                        </label>
                        <input
                          id="zip"
                          {...register("zip")}
                          placeholder="40111"
                          className="min-h-[56px] w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium"
                        />
                        {errors.zip && (
                          <p className="text-xs text-red-500 font-medium">{errors.zip.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center shrink-0">
                      <MapPin className="w-6 h-6 text-[#c85a2d]" />
                    </div>
                    <div>
                      <h2 className="font-display font-black tracking-tight text-[20px] text-slate-900">
                        Zona Pengiriman
                      </h2>
                      <p className="text-[14px] text-[#6b5b4b]">
                        Pilih zona sesuai area tujuan pengiriman Anda.
                      </p>
                    </div>
                  </div>

                  {zonesLoading ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#c85a2d]" />
                      <span className="text-[14px] text-[#6b5b4b]">
                        Memuat zona pengiriman...
                      </span>
                    </div>
                  ) : zones.length === 0 ? (
                    <p className="text-[14px] text-[#9a8772] text-center py-8">
                      Belum ada zona pengiriman tersedia.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {zones.map((zone) => {
                        const isSelected = selectedZoneId === zone.id;
                        return (
                          <label
                            key={zone.id}
                            className={`flex items-center gap-4 rounded-2xl p-5 cursor-pointer transition-all ring-1 ${
                              isSelected
                                ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2 shadow-sm"
                                : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingZone"
                              value={zone.id}
                              checked={isSelected}
                              onChange={() => setSelectedZoneId(zone.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full ring-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "ring-[#c85a2d] bg-[#c85a2d]"
                                  : "ring-[#d4c5b3] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[15px] text-slate-900">
                                {zone.name}
                              </p>
                              {zone.description && (
                                <p className="text-[13px] text-[#6b5b4b] mt-0.5">
                                  {zone.description}
                                </p>
                              )}
                            </div>
                            <span className="font-black text-[15px] text-[#c85a2d] shrink-0">
                              {zone.price === 0
                                ? "Gratis"
                                : formatCurrency(zone.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center shrink-0">
                      <Ticket className="w-6 h-6 text-[#c85a2d]" />
                    </div>
                    <div>
                      <h2 className="font-display font-black tracking-tight text-[20px] text-slate-900">
                        Kode Kupon
                      </h2>
                      <p className="text-[14px] text-[#6b5b4b]">
                        Punya kode diskon? Masukkan di sini.
                      </p>
                    </div>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#7a9d7f]/10 ring-1 ring-[#7a9d7f]/30 p-5">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#7a9d7f]" />
                        <div>
                          <p className="font-bold text-[15px] text-slate-900">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[13px] text-[#5a6a58]">
                            {appliedCoupon.discountType === "PERCENTAGE"
                              ? `Diskon ${appliedCoupon.discountValue}%`
                              : `Diskon ${formatCurrency(appliedCoupon.discountValue)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="h-9 w-9 rounded-full bg-white ring-1 ring-[#e8dcc8] grid place-items-center text-[#6b5b4b] hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          placeholder="Masukkan kode kupon"
                          className="flex-1 min-h-[56px] rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] px-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-mono font-bold uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="min-h-[56px] px-4 md:px-6 rounded-2xl bg-[#3f3328] text-white font-bold text-[14px] hover:bg-[#2a231c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                        >
                          {couponLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span className="hidden md:inline">Terapkan</span>
                              <Check className="w-5 h-5 md:hidden" />
                            </>
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[13px] text-red-500 font-medium px-1">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-8 md:p-10">
                  <div className="grid gap-2">
                    <label
                      htmlFor="notes"
                      className="text-[13px] font-bold text-[#3f3328] uppercase tracking-wider"
                    >
                      Catatan Pesanan (Opsional)
                    </label>
                    <textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Contoh: Titip di satpam jika tidak ada orang."
                      rows={3}
                      className="w-full rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] p-6 text-[15px] text-slate-900 placeholder:text-[#9a8772] focus:outline-none focus:ring-2 focus:ring-[#c85a2d]/30 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="mt-8 p-6 rounded-3xl bg-[#fdf8f6] ring-1 ring-[#c85a2d]/10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#7a9d7f] shrink-0" />
                    <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                      Data Anda terlindungi dengan enkripsi keamanan standar
                      tinggi. Kami tidak akan membagikan data Anda ke pihak
                      ketiga.
                    </p>
                  </div>

                  <div className="mt-10">
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedZoneId}
                      className="w-full min-h-[64px] rounded-full bg-[#c85a2d] text-white font-black text-[18px] shadow-soft hover:bg-[#b04a25] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Lanjut ke Pembayaran</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-10">
              <div className="rounded-[40px] bg-white shadow-soft ring-1 ring-[#e8dcc8] overflow-hidden">
                <div className="bg-[#fcfaf8] px-8 py-6 border-b border-[#e8dcc8]">
                  <h2 className="font-display font-black text-[20px] text-slate-900">
                    Ringkasan Pesanan
                  </h2>
                </div>

                <div className="px-8 py-6 space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin">
                  {items.map((item) => {
                    const accTotal = (item.accessories || []).reduce(
                      (s, a) => s + a.price,
                      0,
                    );
                    const unitPrice = item.price + accTotal;
                    return (
                      <div
                        key={getItemKey(item)}
                        className="flex gap-4 items-start"
                      >
                        <div className="relative h-16 w-16 rounded-2xl bg-[#f5f1ed] ring-1 ring-[#e8dcc8] overflow-hidden shrink-0">
                          {item.image ? (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                              NA
                            </div>
                          )}
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#3f3328] text-white text-[10px] font-black grid place-items-center ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[14px] text-slate-900 truncate">
                            {item.name}
                          </p>
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="mt-0.5 space-y-0.5">
                              {item.accessories.map((acc) => (
                                <p
                                  key={acc.id}
                                  className="text-[11px] text-[#7a9d7f] font-medium"
                                >
                                  + {acc.name} ({formatCurrency(acc.price)})
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-[13px] text-[#c85a2d] font-black mt-0.5">
                            {formatCurrency(unitPrice)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-8 py-8 bg-[#3f3328] text-white space-y-4">
                  <div className="flex justify-between items-center text-[14px] opacity-80">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[14px] text-[#7a9d7f]">
                      <span>Diskon ({appliedCoupon?.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[14px] opacity-80">
                    <span>
                      Ongkir{selectedZone ? ` (${selectedZone.name})` : ""}
                    </span>
                    <span>
                      {selectedZone
                        ? selectedZone.price === 0
                          ? "Gratis"
                          : formatCurrency(shippingCost)
                        : "—"}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-[16px]">Total Bayar</span>
                    <span className="font-black text-[22px] tracking-tight text-white underline decoration-[#c85a2d] decoration-4 underline-offset-4">
                      {selectedZone
                        ? formatCurrency(totalAmount)
                        : formatCurrency(cartTotal - discountAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#7a9d7f]/10 ring-1 ring-[#7a9d7f]/20 p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white grid place-items-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-[#7a9d7f]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-slate-900">
                    Jaminan Keamanan
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#5a6a58]">
                    Kami bekerja sama dengan partner pengiriman terpercaya untuk
                    memastikan pesanan Anda sampai dengan selamat.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#fdf8f6] ring-1 ring-[#c85a2d]/20 p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white grid place-items-center shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-[#c85a2d]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-slate-900">
                    Pre-order (Made to Order)
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6b5b4b]">
                    Semua produk dibuat setelah pemesanan. Produksi <span className="font-bold text-[#c85a2d]">±3 minggu</span> + pengiriman.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}