"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  ArrowRight,
  Loader2,
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
  customerName: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(200, "Nama maksimal 200 karakter"),
  customerEmail: z
    .string()
    .email("Format email tidak valid")
    .max(200, "Email maksimal 200 karakter"),
  customerPhone: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .max(30, "Nomor maksimal 30 karakter"),
  address: z
    .string()
    .min(1, "Alamat wajib diisi")
    .max(500, "Alamat maksimal 500 karakter"),
  city: z
    .string()
    .min(1, "Kota wajib diisi")
    .max(100, "Kota maksimal 100 karakter"),
  zip: z
    .string()
    .min(1, "Kode pos wajib diisi")
    .max(20, "Kode pos maksimal 20 karakter"),
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
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);
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
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  const onSubmit = useCallback(
    async (data: CheckoutFormData) => {
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

      sessionStorage.setItem(
        `checkout_email_${res.data.orderCode}`,
        data.customerEmail,
      );

      router.push(`/checkout/success/${res.data.orderCode}`);
    },
    [
      selectedZoneId,
      appliedCoupon,
      items,
      clearCart,
      router,
      toast,
      orderPlaced,
    ],
  );

  const formSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void handleSubmit(onSubmit)(e as React.FormEvent<HTMLFormElement>);
    },
    [handleSubmit, onSubmit],
  );

  if (items.length === 0) return null;

  return (
    <div className="bg-white min-h-screen text-[#2d241c] font-sans">
      <main
        className="flex-1 px-6 md:px-12 pb-24 w-full max-w-7xl mx-auto"
        id="top"
      >
        <section className="pt-12 md:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            <div className="lg:col-span-7 flex flex-col gap-12">
              <div className="relative">
                <div className="flex flex-col gap-6 mb-12">
                  <Link
                    href="/cart"
                    className="group inline-flex items-center gap-2 self-start text-[14px] font-bold text-[#6b5b4b] hover:text-[#c85a2d] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali Berbelanja</span>
                  </Link>

                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="h-px w-8 bg-[#c85a2d]" />
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                        Langkah 01
                      </span>
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-black text-[#2d241c] leading-tight">
                      Informasi Pengiriman
                    </h1>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-12">
                  {[
                    { id: 1, label: "Alamat", active: true },
                    { id: 2, label: "Bayar", active: false },
                    { id: 3, label: "Selesai", active: false },
                  ].map((step) => (
                    <div key={step.id} className="relative">
                      <div
                        className={`h-1 rounded-full transition-colors duration-500 ${step.active ? "bg-[#c85a2d]" : "bg-[#f5f1ed]"}`}
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`text-[11px] font-black uppercase tracking-widest ${step.active ? "text-[#c85a2d]" : "text-[#9a8772]"}`}
                        >
                          0{step.id} {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form className="space-y-16" onSubmit={formSubmit}>
                {/* Step 1: Receiver Info */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c85a2d] text-white text-xs font-black">
                      1
                    </span>
                    <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                      Informasi Penerima
                    </h2>
                  </div>

                  <div className="grid gap-10">
                    <div className="grid gap-3">
                      <label
                        htmlFor="customerName"
                        className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                      >
                        Nama Lengkap
                      </label>
                      <input
                        id="customerName"
                        {...register("customerName")}
                        placeholder="Nadya Putri"
                        className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                      />
                      {errors.customerName && (
                        <p className="text-xs text-red-500 font-medium px-1">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="grid gap-3">
                        <label
                          htmlFor="customerEmail"
                          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                        >
                          Email
                        </label>
                        <input
                          id="customerEmail"
                          type="email"
                          {...register("customerEmail")}
                          placeholder="nadya@email.com"
                          className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                        />
                        {errors.customerEmail && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.customerEmail.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <label
                          htmlFor="customerPhone"
                          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                        >
                          Nomor WhatsApp
                        </label>
                        <input
                          id="customerPhone"
                          type="tel"
                          {...register("customerPhone")}
                          placeholder="0812345678..."
                          className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <label
                        htmlFor="address"
                        className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                      >
                        Alamat Lengkap
                      </label>
                      <input
                        id="address"
                        {...register("address")}
                        placeholder="Nama jalan, nomor rumah, RT/RW, Kompleks/Cluster"
                        className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500 font-medium px-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                      <div className="grid gap-3">
                        <label
                          htmlFor="city"
                          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                        >
                          Kota / Kabupaten
                        </label>
                        <input
                          id="city"
                          {...register("city")}
                          placeholder="Contoh: Bandung"
                          className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                        />
                        {errors.city && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <label
                          htmlFor="zip"
                          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                        >
                          Kode Pos
                        </label>
                        <input
                          id="zip"
                          {...register("zip")}
                          placeholder="40111"
                          className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium"
                        />
                        {errors.zip && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.zip.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Shipping Zone */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c85a2d] text-white text-xs font-black">
                      2
                    </span>
                    <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                      Zona Pengiriman
                    </h2>
                  </div>

                  {zonesLoading ? (
                    <div className="flex items-center py-4 gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#c85a2d]" />
                      <span className="text-[14px] text-[#6b5b4b]">
                        Memuat zona...
                      </span>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {zones.map((zone) => {
                        const isSelected = selectedZoneId === zone.id;
                        return (
                          <label
                            key={zone.id}
                            className={`group flex items-center gap-5 rounded-3xl p-6 cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-[#fdf8f6] border-[#c85a2d]/40 ring-1 ring-[#c85a2d]/10"
                                : "bg-white border-[#e8dcc8] hover:border-[#c85a2d]/30 shadow-sm"
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
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-[#c85a2d] bg-[#c85a2d]"
                                  : "border-[#e8dcc8] bg-white group-hover:border-[#c85a2d]/50"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-[16px] text-[#2d241c]">
                                {zone.name}
                              </p>
                              {zone.description && (
                                <p className="text-[13px] text-[#6b5b4b] mt-1">
                                  {zone.description}
                                </p>
                              )}
                            </div>
                            <span className="font-black text-[18px] text-[#c85a2d]">
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

                {/* Step 3: Coupon */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c85a2d] text-white text-xs font-black">
                      3
                    </span>
                    <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                      Punya Kupon?
                    </h2>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-4 rounded-3xl bg-[#7a9d7f]/5 border border-[#7a9d7f]/30 p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#7a9d7f]/10 flex items-center justify-center text-[#7a9d7f]">
                          <Check className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-[18px] text-[#2d241c] uppercase tracking-widest">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[14px] font-bold text-[#7a9d7f]">
                            {appliedCoupon.discountType === "PERCENTAGE"
                              ? `Diskon ${appliedCoupon.discountValue}%`
                              : `Hemat ${formatCurrency(appliedCoupon.discountValue)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[13px] font-bold text-red-500 hover:underline px-4 uppercase tracking-widest"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder="KODE KUPON"
                        className="w-full sm:flex-1 h-16 rounded-2xl bg-white border border-[#e8dcc8] px-8 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-black tracking-widest uppercase shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="w-full sm:w-auto sm:px-12 h-16 rounded-2xl bg-[#2d241c] text-white font-black text-[15px] uppercase tracking-widest hover:bg-[#c85a2d] transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Gunakan"
                        )}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-red-500 font-bold px-2">
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="pt-10 space-y-12">
                  <div className="grid gap-3">
                    <label
                      htmlFor="notes"
                      className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
                    >
                      Catatan (Opsional)
                    </label>
                    <textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Contoh: Titip di satpam jika tidak ada orang."
                      rows={4}
                      className="w-full rounded-3xl bg-[#f9f9f9] border border-[#e8dcc8] p-8 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium resize-none shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedZoneId}
                    className="group w-full min-h-[80px] rounded-full bg-[#c85a2d] text-white font-black text-[20px] shadow-lift hover:bg-[#2d241c] hover:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Pesan</span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-10">
              <div className="rounded-[40px] bg-[#f9f9f9] border border-[#e8dcc8]/60 overflow-hidden shadow-sm">
                <div className="px-10 py-8 border-b border-[#e8dcc8]/40">
                  <h2 className="font-display font-black text-2xl text-[#2d241c]">
                    Ringkasan Pesanan
                  </h2>
                </div>

                <div className="px-10 py-8 space-y-6 max-h-[450px] overflow-y-auto overflow-x-hidden no-scrollbar">
                  {items.map((item) => {
                    const accTotal = (item.accessories || []).reduce(
                      (s, a) => s + a.price,
                      0,
                    );
                    const unitPrice = item.price + accTotal;
                    return (
                      <div
                        key={getItemKey(item)}
                        className="flex gap-6 items-start group"
                      >
                        <div className="relative h-20 w-20 rounded-[28px] bg-[#f5f1ed] overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                          {item.image ? (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#9a8772]">
                              NA
                            </div>
                          )}
                          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#2d241c] text-white text-[11px] font-black grid place-items-center ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="font-bold text-[16px] text-[#2d241c] truncate">
                            {item.name}
                          </p>
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5 line-clamp-1">
                              {item.accessories.map((acc) => (
                                <span
                                  key={acc.id}
                                  className="text-[10px] text-[#7a9d7f] font-bold uppercase tracking-wider"
                                >
                                  + {acc.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[15px] text-[#c85a2d] font-black mt-1">
                            {formatCurrency(unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-10 py-10 bg-[#2d241c] text-white space-y-4">
                  <div className="flex justify-between items-center text-[15px] opacity-60">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[15px] text-[#7a9d7f] font-bold">
                      <span>Diskon ({appliedCoupon?.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[15px] opacity-60">
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
                  <div className="pt-8 mt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="font-bold text-[18px]">Total Bayar</span>
                    <div className="text-right">
                      <span className="block text-3xl font-black tracking-tight text-white">
                        {selectedZone
                          ? formatCurrency(totalAmount)
                          : formatCurrency(cartTotal - discountAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[32px] bg-[#fdf8f6] border border-[#c85a2d]/20 p-8 flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#c85a2d] shrink-0 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#2d241c] uppercase tracking-wider">
                      Produksi ±3 Minggu
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#6b5b4b]">
                      Produk eksklusif handmade. Dibuat dengan cinta khusus
                      untuk Anda setelah pembayaran dikonfirmasi.
                    </p>
                  </div>
                </div>

                <div className="rounded-[32px] bg-[#7a9d7f]/5 border border-[#7a9d7f]/20 p-8 flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#7a9d7f] shrink-0 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#2d241c] uppercase tracking-wider">
                      Jaminan Transaksi
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5a6a58]">
                      Data pribadi dan transaksi Anda terlindungi sepenuhnya.
                      Kami menjamin keamanan setiap pengiriman.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
