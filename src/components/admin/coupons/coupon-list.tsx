"use client";

import { Pencil, Trash2, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiDelete } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { AdminCoupon } from "@/types/api";

interface CouponListProps {
  coupons: AdminCoupon[];
  onEdit: (coupon: AdminCoupon) => void;
  onRefresh: () => void;
}

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Tanpa batas";
  const date = new Date(expiresAt);
  const now = new Date();
  const expired = date < now;
  const formatted = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return expired ? `${formatted} (Kedaluwarsa)` : formatted;
}

function formatDiscount(coupon: AdminCoupon) {
  if (coupon.discountType === "PERCENTAGE") {
    return `${coupon.discountValue}%`;
  }
  return formatCurrency(coupon.discountValue);
}

export function CouponList({ coupons, onEdit, onRefresh }: CouponListProps) {
  const toast = useToast();

  async function handleDeactivate(coupon: AdminCoupon) {
    if (!confirm(`Nonaktifkan kupon "${coupon.code}"?`)) return;

    const res = await apiDelete(`/api/admin/coupons/${coupon.id}`);
    if (res.success) {
      toast.success("Kupon dinonaktifkan");
      onRefresh();
    } else {
      toast.error("Gagal menonaktifkan kupon");
    }
  }

  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="h-16 w-16 rounded-full bg-cream grid place-items-center">
          <Ticket className="h-8 w-8 text-warm-gray/50" />
        </div>
        <p className="text-sm font-bold text-warm-gray">
          Belum ada kupon diskon.
        </p>
        <p className="text-xs text-warm-gray/70">
          Buat kupon pertama dengan tombol di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {coupons.map((coupon) => {
          const isExpired =
            coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
          return (
            <div
              key={coupon.id}
              className="rounded-2xl bg-cream/30 p-5 ring-1 ring-warm-sand/20 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-dark-brown text-lg tracking-tight">
                    {coupon.code}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                        coupon.isActive && !isExpired
                          ? "bg-sage/10 text-sage ring-sage/20"
                          : "bg-red-50 text-red-500 ring-red-200"
                      }`}
                    >
                      {!coupon.isActive
                        ? "Nonaktif"
                        : isExpired
                          ? "Kedaluwarsa"
                          : "Aktif"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warm-gray/60">
                      {coupon.discountType === "PERCENTAGE"
                        ? "Persentase"
                        : "Nominal"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-terracotta text-xl">
                    {formatDiscount(coupon)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-warm-sand/20">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60 mb-1">
                    Berlaku Hingga
                  </p>
                  <p
                    className={`text-xs font-bold ${isExpired ? "text-red-500" : "text-dark-brown"}`}
                  >
                    {formatExpiry(coupon.expiresAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60 mb-1">
                    Penggunaan
                  </p>
                  <p className="text-xs font-bold text-dark-brown">
                    {coupon._count.orders}x digunakan
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => onEdit(coupon)}
                  className="flex items-center gap-2 rounded-full bg-warm-sand/50 px-4 py-2 text-dark-brown font-bold text-xs transition-all active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                {coupon.isActive && (
                  <button
                    onClick={() => handleDeactivate(coupon)}
                    className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-red-500 font-bold text-xs transition-all active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Nonaktifkan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60 border-b border-warm-sand/30">
            <tr>
              <th className="text-left pb-4 pl-2">Kode</th>
              <th className="text-center pb-4">Tipe</th>
              <th className="text-right pb-4">Nilai</th>
              <th className="text-center pb-4">Berlaku Hingga</th>
              <th className="text-center pb-4">Dipakai</th>
              <th className="text-center pb-4">Status</th>
              <th className="text-right pb-4 pr-2">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-sand/20">
            {coupons.map((coupon) => {
              const isExpired =
                coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
              return (
                <tr
                  key={coupon.id}
                  className="group hover:bg-cream/30 transition-colors"
                >
                  <td className="py-4 pl-2">
                    <span className="font-mono font-bold text-dark-brown text-sm">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-xs font-medium text-warm-gray">
                      {coupon.discountType === "PERCENTAGE"
                        ? "Persentase"
                        : "Nominal"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-bold text-terracotta text-sm">
                      {formatDiscount(coupon)}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`text-xs font-medium ${isExpired ? "text-red-500" : "text-warm-gray"}`}
                    >
                      {formatExpiry(coupon.expiresAt)}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-sm font-medium text-warm-gray">
                      {coupon._count.orders}x
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                        coupon.isActive && !isExpired
                          ? "bg-sage/10 text-sage ring-sage/20"
                          : "bg-red-50 text-red-500 ring-red-200"
                      }`}
                    >
                      {!coupon.isActive
                        ? "Nonaktif"
                        : isExpired
                          ? "Kedaluwarsa"
                          : "Aktif"}
                    </span>
                  </td>
                  <td className="py-4 pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(coupon)}
                        className="h-9 w-9 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-warm-sand hover:text-dark-brown transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {coupon.isActive && (
                        <button
                          onClick={() => handleDeactivate(coupon)}
                          className="h-9 w-9 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
