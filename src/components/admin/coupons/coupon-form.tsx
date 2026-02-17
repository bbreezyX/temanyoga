"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminCoupon } from "@/types/api";

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
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (coupon) {
        setCode(coupon.code);
        setDiscountType(coupon.discountType as "PERCENTAGE" | "FIXED_AMOUNT");
        setDiscountValue(String(coupon.discountValue));
        setExpiresAt(
          coupon.expiresAt
            ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
            : ""
        );
        setIsActive(coupon.isActive);
      } else {
        setCode("");
        setDiscountType("PERCENTAGE");
        setDiscountValue("");
        setExpiresAt("");
        setIsActive(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [coupon]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valueNum = parseInt(discountValue, 10);
    if (isNaN(valueNum) || valueNum <= 0) {
      toast.error("Nilai diskon harus berupa angka > 0");
      return;
    }

    if (discountType === "PERCENTAGE" && valueNum > 100) {
      toast.error("Persentase diskon maksimal 100%");
      return;
    }

    const data = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: valueNum,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      ...(coupon ? { isActive } : {}),
    };

    setLoading(true);

    const res = coupon
      ? await apiPatch(`/api/admin/coupons/${coupon.id}`, data)
      : await apiPost("/api/admin/coupons", data);

    setLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error || "Gagal menyimpan");
      return;
    }

    toast.success(
      coupon ? "Kupon berhasil diperbarui" : "Kupon berhasil dibuat"
    );
    onSaved();
    onClose();
  }

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
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-cream flex items-center justify-center text-warm-gray hover:text-red-500 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Kode Kupon
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Contoh: DISKON10"
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-mono font-bold text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Berlaku Hingga (opsional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(
                      e.target.value as "PERCENTAGE" | "FIXED_AMOUNT"
                    )
                  }
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
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                  min={1}
                  max={discountType === "PERCENTAGE" ? 100 : undefined}
                  placeholder={discountType === "PERCENTAGE" ? "10" : "50000"}
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Status Kupon</p>
                <p className="text-[10px] text-warm-gray">Kupon yang aktif bisa dipakai pelanggan</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
          <button
            type="button"
            onClick={onClose}
            className="order-2 sm:order-1 px-8 py-3.5 font-bold text-sm text-warm-gray hover:bg-cream rounded-full transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="order-1 sm:order-2 px-10 py-3.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {coupon ? "Simpan Perubahan" : "Buat Kupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
