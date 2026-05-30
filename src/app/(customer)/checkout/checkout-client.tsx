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
  User,
  MapPin,
  Truck,
  Ticket,
  PackageX,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { apiFetch, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
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
  "h-14 w-full rounded-full bg-[#faf6f0] border border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] placeholder:text-[#9a8772] focus:outline-none focus:border-[#c85a2d] focus:bg-white transition-colors font-medium";
const labelClass = "block text-[13px] font-semibold text-[#6b5b4b] ml-1";
const cardClass =
  "rounded-[28px] md:rounded-[40px] border border-[#eadfce] bg-white shadow-soft p-6 md:p-8";

function SectionHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fdf3ee] text-[#c85a2d]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="pt-0.5">
        <h2 className="font-sans text-[18px] md:text-[19px] font-bold leading-tight text-[#2d241c]">
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-[13px] text-[#9a8772]">{hint}</p>}
      </div>
    </div>
  );
}

function ShippingNotice({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#c85a2d] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <p className="text-[15px] font-bold text-[#2d241c]">{title}</p>
        <p className="text-[14px] leading-relaxed text-[#6b5b4b]">{body}</p>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24">
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 md:px-12">
        <section className="pt-10 md:pt-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            {/* LEFT */}
            <div className="flex flex-col gap-7 lg:col-span-7">
              <div className="flex flex-col gap-6">
                <Skeleton className="h-5 w-40 rounded-full bg-[#dcd0bf]" />
                <div>
                  <Skeleton className="mb-3 h-4 w-24 rounded-full bg-[#dcd0bf]" />
                  <Skeleton className="h-10 w-80 max-w-full rounded-3xl bg-[#dcd0bf] md:h-12" />
                </div>
                <div className="flex items-start gap-2.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1">
                      <Skeleton className="h-2 w-full rounded-full bg-[#dcd0bf]" />
                      <Skeleton className="mt-2.5 h-4 w-16 rounded-full bg-[#dcd0bf]" />
                    </div>
                  ))}
                </div>
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft md:rounded-[40px] md:p-8"
                >
                  <div className="mb-6 flex items-start gap-3.5">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                    <div className="space-y-2 pt-0.5">
                      <Skeleton className="h-5 w-40 rounded-full" />
                      <Skeleton className="h-3.5 w-56 max-w-full rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full rounded-full" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Skeleton className="h-14 w-full rounded-full" />
                      <Skeleton className="h-14 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-5 lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-soft md:rounded-[40px]">
                <div className="flex items-center justify-between px-4 pb-3 pt-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="space-y-4 px-4 pb-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-[68px] w-[68px] shrink-0 rounded-[18px] bg-[#f5f1ed]" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-4 w-2/3 rounded-full" />
                        <Skeleton className="h-4 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-4 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-5 md:rounded-[32px]">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                  <div className="flex items-end justify-between border-t border-[#e8dcc8] pt-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-[58px] w-full rounded-full bg-[#dcd0bf]" />

              <div className="space-y-4 rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-soft">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 max-w-full rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
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

  if (!isLoaded) return <CheckoutSkeleton />;
  if (items.length === 0) return null;

  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24">
      <main
        className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 md:px-12"
        id="top"
      >
        <section className="pt-10 md:pt-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            {/* LEFT — Form */}
            <div className="flex flex-col gap-7 lg:col-span-7">
              {/* Header */}
              <div className="flex flex-col gap-6">
                <Link
                  href="/cart"
                  className="group inline-flex items-center gap-2 self-start text-[14px] font-semibold text-[#6b5b4b] transition-colors hover:text-[#c85a2d]"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Kembali ke Keranjang</span>
                </Link>

                <div>
                  <div className="mb-3 inline-flex items-center gap-2">
                    <span className="h-px w-8 bg-[#c85a2d]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c85a2d]">
                      Checkout
                    </span>
                  </div>
                  <h1 className="font-display text-3xl leading-[1.05] text-[#2d241c] md:text-[44px]">
                    Selesaikan Pesanan
                  </h1>
                </div>

                {/* Real progress */}
                <div className="flex items-start gap-2.5">
                  {progressSteps.map((step, i) => (
                    <div key={step.label} className="flex-1">
                      <div
                        className={`h-2 rounded-full transition-colors duration-500 ${
                          step.done
                            ? "bg-[#c85a2d]"
                            : step.active
                              ? "bg-[#c85a2d]/35"
                              : "bg-[#dcd0bf]"
                        }`}
                      />
                      <div className="mt-2.5 flex items-center gap-1.5">
                        {step.done ? (
                          <Check className="h-3.5 w-3.5 text-[#c85a2d]" />
                        ) : (
                          <span
                            className={`text-[11px] font-bold ${
                              step.active ? "text-[#2d241c]" : "text-[#a89683]"
                            }`}
                          >
                            {i + 1}
                          </span>
                        )}
                        <span
                          className={`text-[12px] font-semibold ${
                            step.done
                              ? "text-[#c85a2d]"
                              : step.active
                                ? "text-[#2d241c]"
                                : "text-[#a89683]"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                id="checkout-form"
                className="flex flex-col gap-5"
                onSubmit={formSubmit}
              >
                {/* Card 1 — Receiver info */}
                <div className={cardClass}>
                  <SectionHeader
                    icon={User}
                    title="Informasi Penerima"
                    hint="Untuk konfirmasi pesanan via WhatsApp & email"
                  />
                  <div className="space-y-5">
                    <div className="space-y-2">
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
                        <p className="px-1 text-xs font-medium text-red-500">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
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
                          <p className="px-1 text-xs font-medium text-red-500">
                            {errors.customerEmail.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
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
                          <p className="px-1 text-xs font-medium text-red-500">
                            {errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Address */}
                <div className={cardClass}>
                  <SectionHeader
                    icon={MapPin}
                    title="Alamat Pengiriman"
                    hint="Tujuan paket dikirim"
                  />
                  <AddressFields
                    value={addressData}
                    onChange={handleAddressChange}
                    errors={addressErrors}
                  />
                </div>

                {/* Card 3 — Shipping */}
                <div className={cardClass}>
                  <SectionHeader
                    icon={Truck}
                    title="Pilih Kurir"
                    hint="Ongkir dihitung otomatis dari alamat"
                  />

                  {!addressData.village?.code ? (
                    <ShippingNotice
                      icon={MapPin}
                      title="Lengkapi alamat dulu"
                      body="Pilih kelurahan tujuan untuk menampilkan pilihan kurir dan ongkir secara otomatis."
                    />
                  ) : shippingLoading ? (
                    <div className="flex items-center gap-3 py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#c85a2d]" />
                      <span className="text-[14px] text-[#6b5b4b]">
                        Menghitung ongkir...
                      </span>
                    </div>
                  ) : shippingError ? (
                    isAllowedCourierUnavailable ? (
                      <ShippingNotice
                        icon={PackageX}
                        title="Kurir belum tersedia"
                        body="JNE, J&T, Lion Parcel, dan AnterAja belum melayani kelurahan ini. Coba alamat lain atau hubungi admin untuk opsi pengiriman manual."
                      />
                    ) : isShippingServiceUnavailable ? (
                      <ShippingNotice
                        icon={AlertTriangle}
                        title="Layanan ongkir sedang gangguan"
                        body="Tunggu beberapa saat lalu coba lagi. Jika masih berlanjut, hubungi admin agar kami bantu cek ongkir manual untuk alamat Anda."
                      />
                    ) : (
                      <p className="py-2 text-[14px] font-medium text-red-500">
                        {shippingError}
                      </p>
                    )
                  ) : shippingResult?.couriers && shippingResult.couriers.length > 0 ? (
                    <div className="grid gap-3">
                      {shippingResult.couriers.map((courier) => {
                        const isSelected = selectedCourierCode === courier.courier_code;
                        return (
                          <label
                            key={courier.courier_code}
                            className={`flex cursor-pointer items-center gap-4 rounded-3xl border p-4 transition-colors md:p-5 ${
                              isSelected
                                ? "border-[#c85a2d] bg-[#fdf3ee]"
                                : "border-[#e8dcc8] bg-white hover:border-[#c85a2d]/40 hover:bg-[#faf6f0]"
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
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                isSelected
                                  ? "border-[#c85a2d] bg-[#c85a2d]"
                                  : "border-[#e8dcc8] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-bold text-[#2d241c]">
                                {courier.courier_name}
                              </p>
                              {courier.estimation && (
                                <p className="mt-0.5 text-[13px] text-[#6b5b4b]">
                                  Estimasi: {courier.estimation}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-[16px] font-bold text-[#c85a2d]">
                              {formatCurrency(courier.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {/* Card 4 — Coupon & notes */}
                <div className={cardClass}>
                  <SectionHeader
                    icon={Ticket}
                    title="Kupon & Catatan"
                    hint="Opsional"
                  />

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className={labelClass}>Kode kupon</label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[#7a9d7f]/30 bg-[#7a9d7f]/[0.08] p-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#7a9d7f]/15 text-[#5a8d5f]">
                              <Check className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-[15px] font-bold uppercase tracking-wide text-[#2d241c]">
                                {appliedCoupon.code}
                              </p>
                              <p className="text-[13px] font-semibold text-[#5a8d5f]">
                                {appliedCoupon.discountType === "PERCENTAGE"
                                  ? `Diskon ${appliedCoupon.discountValue}%`
                                  : `Hemat ${formatCurrency(appliedCoupon.discountValue)}`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="shrink-0 px-2 text-[13px] font-semibold text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError(null);
                            }}
                            placeholder="Punya kode kupon?"
                            className="h-14 w-full rounded-full border border-[#e8dcc8] bg-[#faf6f0] px-6 text-[16px] font-semibold uppercase tracking-wide text-[#2d241c] transition-colors placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-[#9a8772] focus:border-[#c85a2d] focus:bg-white focus:outline-none sm:flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#f0e7da] px-8 text-[14px] font-bold text-[#2d241c] transition-colors hover:bg-[#e8dcc8] disabled:opacity-40 sm:w-auto"
                          >
                            {couponLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              "Pakai"
                            )}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="px-1 text-sm font-semibold text-red-500">
                          {couponError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="notes" className={labelClass}>
                        Catatan untuk penjual
                      </label>
                      <textarea
                        id="notes"
                        {...register("notes")}
                        placeholder="Contoh: Titip di satpam jika tidak ada orang."
                        rows={3}
                        className="w-full resize-none rounded-[24px] border border-[#e8dcc8] bg-[#faf6f0] p-5 text-[16px] font-medium text-[#2d241c] transition-colors placeholder:text-[#9a8772] focus:border-[#c85a2d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT — Order summary */}
            <div className="flex flex-col gap-5 lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-soft md:rounded-[40px]">
                <div className="flex items-center justify-between px-4 pb-3 pt-4">
                  <h2 className="font-display text-lg text-[#2d241c]">
                    Ringkasan
                  </h2>
                  <span className="rounded-full bg-[#faf6f0] px-3 py-1 text-[12px] font-semibold text-[#6b5b4b]">
                    {items.length} item
                  </span>
                </div>

                <div className="max-h-[360px] space-y-4 overflow-y-auto overflow-x-hidden px-4 no-scrollbar">
                  {items.map((item) => {
                    const accTotal = (item.accessories || []).reduce(
                      (s, a) => s + a.price,
                      0,
                    );
                    const unitPrice = item.price + accTotal;
                    return (
                      <div
                        key={getItemKey(item)}
                        className="flex items-start gap-4"
                      >
                        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[18px] bg-[#f5f1ed]">
                          {item.image ? (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#9a8772]">
                              NA
                            </div>
                          )}
                          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#2d241c] text-[11px] font-bold text-white ring-2 ring-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold text-[#2d241c]">
                            {item.name}
                          </p>
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {item.accessories.map((acc) => (
                                <span
                                  key={`${acc.id}-${acc.selectedColor ?? "default"}`}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#7a9d7f]"
                                >
                                  + {acc.name}
                                  {acc.selectedColor ? ` (${acc.selectedColor})` : ""}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-1 text-[14px] font-bold text-[#c85a2d]">
                            {formatCurrency(unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 space-y-3 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-5 md:rounded-[32px]">
                  <div className="flex items-center justify-between text-[14px] text-[#6b5b4b]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#2d241c]">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[14px] font-semibold text-[#5a8d5f]">
                      <span>Diskon ({appliedCoupon?.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[14px] text-[#6b5b4b]">
                    <span>
                      Ongkir
                      {selectedCourierCode && shippingResult?.couriers
                        ? ` (${shippingResult.couriers.find((c) => c.courier_code === selectedCourierCode)?.courier_name || ""})`
                        : ""}
                    </span>
                    <span className="font-semibold text-[#2d241c]">
                      {hasShippingSelection
                        ? shippingCost === 0
                          ? "Gratis"
                          : formatCurrency(shippingCost)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-t border-[#e8dcc8] pt-3">
                    <span className="text-[15px] font-bold text-[#2d241c]">
                      Total Bayar
                    </span>
                    <span className="text-[26px] font-extrabold tracking-tight text-[#c85a2d]">
                      {formatCurrency(displayedTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !hasShippingSelection}
                className="group flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full bg-[#c85a2d] text-[15px] font-bold uppercase tracking-wide text-white shadow-lift transition-all hover:bg-[#b14f27] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                  </>
                )}
              </button>

              {/* Trust — slim single card */}
              <div className="space-y-4 rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fdf3ee] text-[#c85a2d]">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#2d241c]">
                      Produksi ±3 Minggu
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#6b5b4b]">
                      Handmade, dibuat khusus setelah pembayaran dikonfirmasi.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[#eadfce]" />
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#7a9d7f]/12 text-[#5a8d5f]">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#2d241c]">
                      Jaminan Transaksi
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#5a6a58]">
                      Data pribadi & transaksi Anda terlindungi sepenuhnya.
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
