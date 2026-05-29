"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import useSWR from "swr";
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
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import {
  NO_ALLOWED_COURIER_MESSAGE,
  SHIPPING_API_UNAVAILABLE_MESSAGE,
} from "@/lib/shipping-couriers";
import {
  AddressFields,
  type AddressData,
} from "@/components/checkout/address-fields";
import type {
  CreateOrderResponse,
  CouponValidationResult,
  ShippingCostResponse,
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
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

const addressSchema = z.object({
  province: z.object(
    {
      code: z.string(),
      name: z.string(),
    },
    "Pilih Provinsi",
  ),
  regency: z.object(
    {
      code: z.string(),
      name: z.string(),
    },
    "Pilih Kota/Kabupaten",
  ),
  district: z.object(
    {
      code: z.string(),
      name: z.string(),
    },
    "Pilih Kecamatan",
  ),
  village: z.object(
    {
      code: z.string(),
      name: z.string(),
    },
    "Pilih Kelurahan",
  ),
  streetAddress: z
    .string()
    .min(1, "Alamat wajib diisi")
    .max(500, "Alamat maksimal 500 karakter"),
  postalCode: z
    .string()
    .min(1, "Kode pos wajib diisi")
    .max(20, "Kode pos maksimal 20 karakter"),
});

const inputClass =
  "h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium";
const labelClass =
  "text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]";
const cardClass =
  "rounded-[32px] border border-[#e8dcc8]/70 bg-white shadow-soft p-6 md:p-8";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-5 w-1.5 rounded-full bg-[#c85a2d] shrink-0" />
      <h2 className="font-display tracking-tight text-xl md:text-2xl text-[#2d241c]">
        {title}
      </h2>
    </div>
  );
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, cartTotal, clearCart, getItemKey, isLoaded } = useCart();
  const toast = useToast();

  const [selectedCourierCode, setSelectedCourierCode] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [addressData, setAddressData] = useState<AddressData>({
    province: null,
    regency: null,
    district: null,
    village: null,
    streetAddress: "",
    postalCode: "",
  });
  const [addressErrors, setAddressErrors] = useState<
    Record<string, { message: string }>
  >({});

  const shippingWeight = items.reduce((sum, item) => sum + item.quantity, 0) || 1;
  const shippingRequestKey = addressData.village?.code
    ? ["/api/shipping-cost", addressData.village.code, shippingWeight]
    : null;
  const { data: shippingData, error: shippingRequestError, isLoading: shippingLoading } =
    useSWR(
      shippingRequestKey,
      async ([endpoint, destinationVillageCode, weight]: [
        string,
        string,
        number,
      ]) => {
        const res = await apiFetch<ShippingCostResponse>(
          `${endpoint}?destination_village_code=${destinationVillageCode}&weight=${weight}`,
        );

        if (!res.success) {
          throw new Error(res.error || SHIPPING_API_UNAVAILABLE_MESSAGE);
        }

        return res.data;
      },
    );
  const shippingResult = shippingData ?? null;
  const shippingError = shippingRequestError?.message ?? null;
  const isAllowedCourierUnavailable = shippingError === NO_ALLOWED_COURIER_MESSAGE;
  const isShippingServiceUnavailable =
    shippingError === SHIPPING_API_UNAVAILABLE_MESSAGE;
  const shippingCost =
    shippingResult?.couriers?.find((c) => c.courier_code === selectedCourierCode)
      ?.price ?? 0;
  const hasShippingSelection = !!shippingResult?.couriers?.some(
    (courier) => courier.courier_code === selectedCourierCode,
  );

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "PERCENTAGE"
      ? Math.floor((cartTotal * appliedCoupon.discountValue) / 100)
      : Math.min(appliedCoupon.discountValue, cartTotal)
    : 0;
  const totalAmount = cartTotal - discountAmount + shippingCost;
  const displayedTotal = hasShippingSelection
    ? totalAmount
    : cartTotal - discountAmount;

  const orderPlaced = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
  });

  // Real progress derived from form + address + courier state
  const [watchedName, watchedEmail, watchedPhone] = useWatch({
    control,
    name: ["customerName", "customerEmail", "customerPhone"],
  });
  const hasReceiverInfo = Boolean(
    watchedName?.trim() && watchedEmail?.trim() && watchedPhone?.trim(),
  );
  const hasAddress = Boolean(
    addressData.village?.code &&
      addressData.streetAddress.trim() &&
      addressData.postalCode.trim(),
  );
  const step1Done = hasReceiverInfo && hasAddress;
  const step2Done = hasShippingSelection;
  const progressSteps = [
    { label: "Penerima", done: step1Done, active: !step1Done },
    { label: "Kurir", done: step2Done, active: step1Done && !step2Done },
    { label: "Selesai", done: false, active: step1Done && step2Done },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (items.length === 0 && !orderPlaced.current) {
      router.replace("/cart");
    }
  }, [isLoaded, items.length, router]);

  const handleAddressChange = useCallback((nextAddress: AddressData) => {
    const currentVillageCode = addressData.village?.code;
    const nextVillageCode = nextAddress.village?.code;

    if (currentVillageCode !== nextVillageCode) {
      setSelectedCourierCode(null);
    }

    setAddressData(nextAddress);
  }, [addressData.village?.code]);

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
      if (!hasShippingSelection) {
        toast.error("Mohon pilih kurir atau zona pengiriman.");
        return;
      }

      const addressValidation = addressSchema.safeParse(addressData);
      if (!addressValidation.success) {
        const newErrors: Record<string, { message: string }> = {};
        for (const issue of addressValidation.error.issues) {
          const path = issue.path.join(".");
          newErrors[path] = { message: issue.message };
        }
        setAddressErrors(newErrors);
        toast.error("Mohon lengkapi data alamat.");
        return;
      }

      setAddressErrors({});

      const shippingAddress = [
        addressData.streetAddress,
        addressData.village?.name,
        addressData.district?.name,
        addressData.regency?.name,
        addressData.province?.name,
        addressData.postalCode,
      ].join(", ");

      // Build order payload based on shipping mode
      const orderPayload: Record<string, unknown> = {
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim().toLowerCase(),
        customerPhone: data.customerPhone.trim(),
        shippingAddress,
        notes: data.notes?.trim() || undefined,
        couponCode: appliedCoupon?.code || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          accessorySelections: (i.accessories || []).map((accessory) => ({
            accessoryId: accessory.id,
            selectedColor: accessory.selectedColor,
          })),
        })),
      };

      if (selectedCourierCode && shippingResult?.couriers) {
        const courier = shippingResult.couriers.find(
          (c) => c.courier_code === selectedCourierCode,
        );
        orderPayload.destinationVillageCode = addressData.village?.code;
        orderPayload.selectedCourierCode = selectedCourierCode;
        orderPayload.selectedCourierName = courier?.courier_name || selectedCourierCode;
      }

      const res = await apiPost<CreateOrderResponse>("/api/orders", orderPayload);

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
      hasShippingSelection,
      shippingResult,
      selectedCourierCode,
      appliedCoupon,
      items,
      clearCart,
      router,
      toast,
      orderPlaced,
      addressData,
    ],
  );

  const formSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void handleSubmit(onSubmit)(e as React.FormEvent<HTMLFormElement>);
    },
    [handleSubmit, onSubmit],
  );

  if (!isLoaded || items.length === 0) return null;

  return (
    <div className="bg-white min-h-screen text-[#2d241c] font-sans">
      <main
        className="flex-1 px-6 md:px-12 pb-32 lg:pb-24 w-full max-w-7xl mx-auto"
        id="top"
      >
        <section className="pt-12 md:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* LEFT — Form */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col gap-6">
                <Link
                  href="/cart"
                  className="group inline-flex items-center gap-2 self-start text-[14px] font-bold text-[#6b5b4b] hover:text-[#c85a2d] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Kembali ke Keranjang</span>
                </Link>

                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="h-px w-8 bg-[#c85a2d]" />
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                      Checkout
                    </span>
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl text-[#2d241c] leading-[1.1]">
                    Selesaikan Pesanan
                  </h1>
                </div>

                {/* Real progress */}
                <div className="grid grid-cols-3 gap-3">
                  {progressSteps.map((step, i) => (
                    <div key={step.label}>
                      <div
                        className={`h-1.5 rounded-full transition-colors duration-500 ${
                          step.done
                            ? "bg-[#c85a2d]"
                            : step.active
                              ? "bg-[#c85a2d]/40"
                              : "bg-[#f5f1ed]"
                        }`}
                      />
                      <div className="mt-3 flex items-center gap-1.5">
                        {step.done && (
                          <Check className="w-3 h-3 text-[#c85a2d]" />
                        )}
                        <span
                          className={`text-[11px] font-black uppercase tracking-widest ${
                            step.done
                              ? "text-[#c85a2d]"
                              : step.active
                                ? "text-[#2d241c]"
                                : "text-[#9a8772]"
                          }`}
                        >
                          0{i + 1} {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                id="checkout-form"
                className="flex flex-col gap-6"
                onSubmit={formSubmit}
              >
                {/* Card 1 — Receiver info */}
                <div className={`${cardClass} space-y-7`}>
                  <SectionHeader title="Informasi Penerima" />
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label htmlFor="customerName" className={labelClass}>
                        Nama Lengkap
                      </label>
                      <input
                        id="customerName"
                        {...register("customerName")}
                        placeholder="Contoh: Raisa Andriana"
                        className={inputClass}
                      />
                      {errors.customerName && (
                        <p className="text-xs text-red-500 font-medium px-1">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="grid gap-3">
                        <label htmlFor="customerEmail" className={labelClass}>
                          Email
                        </label>
                        <input
                          id="customerEmail"
                          type="email"
                          {...register("customerEmail")}
                          placeholder="raisa@email.com"
                          className={inputClass}
                        />
                        {errors.customerEmail && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.customerEmail.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <label htmlFor="customerPhone" className={labelClass}>
                          Nomor WhatsApp
                        </label>
                        <input
                          id="customerPhone"
                          type="tel"
                          {...register("customerPhone")}
                          placeholder="0812345678..."
                          className={inputClass}
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-red-500 font-medium px-1">
                            {errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Address */}
                <div className={`${cardClass} space-y-7`}>
                  <SectionHeader title="Alamat Pengiriman" />
                  <AddressFields
                    value={addressData}
                    onChange={handleAddressChange}
                    errors={addressErrors}
                  />
                </div>

                {/* Card 3 — Shipping */}
                <div className={`${cardClass} space-y-7`}>
                  <SectionHeader title="Pilih Kurir" />

                  {!addressData.village?.code ? (
                    <div className="rounded-[24px] border border-dashed border-[#e8dcc8] bg-[#fbf7f3] px-6 py-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                            Menunggu Alamat Lengkap
                          </p>
                          <p className="text-[16px] font-bold leading-snug text-[#2d241c]">
                            Lengkapi kelurahan untuk menampilkan pilihan kurir.
                          </p>
                          <p className="max-w-xl text-[14px] leading-relaxed text-[#6b5b4b]">
                            Setelah kelurahan dipilih, ongkir dan estimasi
                            pengiriman akan muncul otomatis di sini.
                          </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-[#eadfce] bg-white px-4 py-3">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a8772]">
                            Status
                          </span>
                          <span className="mt-1 block text-[14px] font-bold text-[#6b5b4b]">
                            Belum Bisa Dihitung
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : shippingLoading ? (
                    <div className="flex items-center py-2 gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#c85a2d]" />
                      <span className="text-[14px] text-[#6b5b4b]">
                        Menghitung ongkir...
                      </span>
                    </div>
                  ) : shippingError ? (
                    isAllowedCourierUnavailable ? (
                      <div className="rounded-[24px] border border-dashed border-[#e8dcc8] bg-[#fbf7f3] px-6 py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                              Kurir Belum Tersedia
                            </p>
                            <p className="text-[16px] font-bold leading-snug text-[#2d241c]">
                              JNE, J&amp;T, Lion Parcel, dan AnterAja belum melayani kelurahan ini.
                            </p>
                            <p className="max-w-xl text-[14px] leading-relaxed text-[#6b5b4b]">
                              Periksa kembali kelurahan tujuan, gunakan alamat penerima lain,
                              atau hubungi admin agar kami bantu cek opsi pengiriman manual.
                            </p>
                          </div>

                          <div className="shrink-0 rounded-2xl border border-[#eadfce] bg-white px-4 py-3">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a8772]">
                              Status
                            </span>
                            <span className="mt-1 block text-[14px] font-bold text-[#6b5b4b]">
                              Alamat Belum Terjangkau
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : isShippingServiceUnavailable ? (
                      <div className="rounded-[24px] border border-dashed border-[#e8dcc8] bg-[#fbf7f3] px-6 py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
                              Layanan Sedang Bermasalah
                            </p>
                            <p className="text-[16px] font-bold leading-snug text-[#2d241c]">
                              Ongkir belum bisa dimuat karena layanan cek ongkir sedang gangguan.
                            </p>
                            <p className="max-w-xl text-[14px] leading-relaxed text-[#6b5b4b]">
                              Tunggu beberapa saat lalu coba lagi. Jika masih berlanjut,
                              hubungi admin agar kami bantu cek ongkir manual untuk alamat Anda.
                            </p>
                          </div>

                          <div className="shrink-0 rounded-2xl border border-[#eadfce] bg-white px-4 py-3">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a8772]">
                              Status
                            </span>
                            <span className="mt-1 block text-[14px] font-bold text-[#6b5b4b]">
                              Coba Lagi Nanti
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] text-red-500 font-medium py-2">
                        {shippingError}
                      </p>
                    )
                  ) : shippingResult?.couriers && shippingResult.couriers.length > 0 ? (
                    <div className="grid gap-4">
                      {shippingResult.couriers.map((courier) => {
                        const isSelected = selectedCourierCode === courier.courier_code;
                        return (
                          <label
                            key={courier.courier_code}
                            className={`group flex items-center gap-5 rounded-3xl p-5 cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-[#fdf8f6] border-[#c85a2d]/40 ring-1 ring-[#c85a2d]/10"
                                : "bg-white border-[#e8dcc8] hover:border-[#c85a2d]/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingOption"
                              value={courier.courier_code}
                              checked={isSelected}
                              onChange={() => setSelectedCourierCode(courier.courier_code)}
                              className="sr-only"
                            />
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                isSelected
                                  ? "border-[#c85a2d] bg-[#c85a2d]"
                                  : "border-[#e8dcc8] bg-white group-hover:border-[#c85a2d]/50"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[16px] text-[#2d241c]">
                                {courier.courier_name}
                              </p>
                              {courier.estimation && (
                                <p className="text-[13px] text-[#6b5b4b] mt-1">
                                  Estimasi: {courier.estimation}
                                </p>
                              )}
                            </div>
                            <span className="font-black text-[18px] text-[#c85a2d] shrink-0">
                              {formatCurrency(courier.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {/* Card 4 — Coupon */}
                <div className={`${cardClass} space-y-7`}>
                  <SectionHeader title="Punya Kupon?" />

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-4 rounded-3xl bg-[#7a9d7f]/5 border border-[#7a9d7f]/30 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#7a9d7f]/10 flex items-center justify-center text-[#7a9d7f] shrink-0">
                          <Check className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-[17px] text-[#2d241c] uppercase tracking-widest">
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
                        className="text-[12px] font-bold text-red-500 hover:underline px-2 uppercase tracking-widest shrink-0"
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
                        className="w-full sm:flex-1 h-14 rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-black tracking-widest uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="w-full sm:w-auto sm:px-10 h-14 rounded-2xl bg-[#2d241c] text-white font-black text-[14px] uppercase tracking-widest hover:bg-[#c85a2d] transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
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
                    <p className="text-sm text-red-500 font-bold px-1">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Card 5 — Notes */}
                <div className={`${cardClass} space-y-7`}>
                  <SectionHeader title="Catatan (Opsional)" />
                  <textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Contoh: Titip di satpam jika tidak ada orang."
                    rows={4}
                    className="w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] p-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] transition-all font-medium resize-none"
                  />
                </div>
              </form>
            </div>

            {/* RIGHT — Order summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-6">
              <div className="rounded-[40px] bg-white border border-[#e8dcc8]/70 overflow-hidden shadow-soft">
                <div className="px-7 md:px-8 py-7 border-b border-[#e8dcc8]/50">
                  <h2 className="font-display font-black text-2xl text-[#2d241c]">
                    Ringkasan Pesanan
                  </h2>
                </div>

                <div className="px-7 md:px-8 py-7 space-y-6 max-h-[420px] overflow-y-auto overflow-x-hidden no-scrollbar">
                  {items.map((item) => {
                    const accTotal = (item.accessories || []).reduce(
                      (s, a) => s + a.price,
                      0,
                    );
                    const unitPrice = item.price + accTotal;
                    return (
                      <div
                        key={getItemKey(item)}
                        className="flex gap-5 items-start group"
                      >
                        <div className="relative h-20 w-20 rounded-[24px] bg-[#f5f1ed] overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
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
                          <p className="font-bold text-[15px] text-[#2d241c] truncate">
                            {item.name}
                          </p>
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5 line-clamp-1">
                              {item.accessories.map((acc) => (
                                <span
                                  key={`${acc.id}-${acc.selectedColor ?? "default"}`}
                                  className="text-[10px] text-[#7a9d7f] font-bold uppercase tracking-wider"
                                >
                                  + {acc.name}
                                  {acc.selectedColor ? ` (${acc.selectedColor})` : ""}
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

                <div className="px-7 md:px-8 py-8 bg-[#2d241c] text-white space-y-4">
                  <div className="flex justify-between items-center text-[15px] opacity-60">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[15px] text-[#a9c7ad] font-bold">
                      <span>Diskon ({appliedCoupon?.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[15px] opacity-60">
                    <span>
                      Ongkir
                      {selectedCourierCode && shippingResult?.couriers
                        ? ` (${shippingResult.couriers.find((c) => c.courier_code === selectedCourierCode)?.courier_name || ""})`
                        : ""}
                    </span>
                    <span>
                      {hasShippingSelection
                        ? shippingCost === 0
                          ? "Gratis"
                          : formatCurrency(shippingCost)
                        : "—"}
                    </span>
                  </div>
                  <div className="pt-6 mt-2 border-t border-white/10 flex justify-between items-end">
                    <span className="font-bold text-[18px]">Total Bayar</span>
                    <span className="block text-3xl font-black tracking-tight text-white">
                      {formatCurrency(displayedTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit (desktop) */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !hasShippingSelection}
                className="group hidden lg:flex w-full min-h-[60px] rounded-full bg-[#c85a2d] text-white font-black text-[16px] uppercase tracking-widest shadow-lift hover:bg-[#2d241c] transition-all active:scale-[0.98] disabled:opacity-40 items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </>
                )}
              </button>

              {/* Trust cards — slim */}
              <div className="grid gap-4">
                <div className="rounded-[24px] bg-[#fdf8f6] border border-[#c85a2d]/15 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#c85a2d] shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-[#2d241c] uppercase tracking-wider">
                      Produksi ±3 Minggu
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6b5b4b]">
                      Handmade, dibuat khusus untuk Anda setelah pembayaran
                      dikonfirmasi.
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#7a9d7f]/5 border border-[#7a9d7f]/20 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#7a9d7f] shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-[#2d241c] uppercase tracking-wider">
                      Jaminan Transaksi
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#5a6a58]">
                      Data pribadi & transaksi Anda terlindungi sepenuhnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky mobile submit bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#e8dcc8] bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8772] leading-none">
              Total Bayar
            </p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#c85a2d] leading-none">
              {formatCurrency(displayedTotal)}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || !hasShippingSelection}
            className="flex-1 min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full bg-[#c85a2d] text-white font-black text-[14px] uppercase tracking-widest shadow-lift-sm hover:bg-[#2d241c] transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Pesan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
