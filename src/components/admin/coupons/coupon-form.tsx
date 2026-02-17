"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminCoupon } from "@/types/api";

const couponFormSchema = z.object({
  code: z.string().min(1, "Kode kupon wajib diisi").max(30, "Kode maksimal 30 karakter"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.string().min(1, "Nilai diskon wajib diisi").refine(
    (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0,
    "Nilai diskon harus berupa angka positif"
  ),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
}).refine(
  (data) => {
    const num = parseInt(data.discountValue, 10);
    if (data.discountType === "PERCENTAGE" && num > 100) {
      return false;
    }
    return true;
  },
  { message: "Persentase diskon maksimal 100%", path: ["discountValue"] }
);

type CouponFormData = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon: AdminCoupon | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CouponForm({
  coupon,
  onClose,
  onSaved,
}: CouponFormProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      discountType: (coupon?.discountType as "PERCENTAGE" | "FIXED_AMOUNT") ?? "PERCENTAGE",
      discountValue: coupon?.discountValue ? String(coupon.discountValue) : "",
      expiresAt: coupon?.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: coupon?.isActive ?? true,
    },
  });

  const discountType = watch("discountType");
  const isActive = watch("isActive");

  const onSubmit = async (data: CouponFormData) => {
    const payload = {
      code: data.code.trim().toUpperCase(),
      discountType: data.discountType,
      discountValue: parseInt(data.discountValue, 10),
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      ...(coupon ? { isActive: data.isActive } : {}),
    };

    const res = coupon
      ? await apiPatch(`/api/admin/coupons/${coupon.id}`, payload)
      : await apiPost("/api/admin/coupons", payload);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }

    toast.success(coupon ? "Kupon berhasil diperbarui" : "Kupon berhasil dibuat");
    onSaved();
    onClose();
    reset();
  };

  const handleReset = () => {
    reset();
    onClose();
  };

  return (
    <div className="rounded-[32px] bg-white p-6 sm:p-8 ring-1 ring-warm-sand/50 shadow-soft animate-fade-in-up mb-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-extrabold text-dark-brown">
            {coupon ? "Edit Kupon" : "Tambah Kupon Baru"}
          </h2>
          <p className="text-xs text-warm-gray font-medium mt-1">
            Atur kode diskon untuk pelanggan di bawah ini.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="h-10 w-10 rounded-full bg-cream flex items-center justify-center text-warm-gray hover:text-red-500 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Kode Kupon
              </label>
              <input
                {...register("code")}
                placeholder="Contoh: DISKON10"
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-mono font-bold text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all uppercase"
              />
              {errors.code && (
                <p className="text-xs text-red-500 font-medium">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Berlaku Hingga (opsional)
              </label>
              <input
                type="datetime-local"
                {...register("expiresAt")}
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Tipe Diskon
                </label>
                <select
                  {...register("discountType")}
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  {discountType === "PERCENTAGE" ? "Nilai (%)" : "Nilai (Rp)"}
                </label>
                <input
                  type="number"
                  {...register("discountValue")}
                  placeholder={discountType === "PERCENTAGE" ? "10" : "50000"}
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
                {errors.discountValue && (
                  <p className="text-xs text-red-500 font-medium">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Status Kupon</p>
                <p className="text-[10px] text-warm-gray">Kupon yang aktif bisa dipakai pelanggan</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
          <button
            type="button"
            onClick={handleReset}
            className="order-2 sm:order-1 px-8 py-3.5 font-bold text-sm text-warm-gray hover:bg-cream rounded-full transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="order-1 sm:order-2 px-10 py-3.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {coupon ? "Simpan Perubahan" : "Buat Kupon"}
          </button>
        </div>
      </form>
    </div>
  );
}