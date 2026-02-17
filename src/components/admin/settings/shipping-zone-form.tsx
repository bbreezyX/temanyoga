"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminShippingZone } from "@/types/api";

const shippingZoneFormSchema = z.object({
  name: z.string().min(1, "Nama zona wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  price: z.string().refine(
    (val) => val !== "" && !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
    "Harga harus berupa angka >= 0"
  ),
  sortOrder: z.string().refine(
    (val) => val === "" || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0),
    "Urutan harus berupa angka >= 0"
  ).optional(),
  isActive: z.boolean(),
});

type ShippingZoneFormData = z.infer<typeof shippingZoneFormSchema>;

interface ShippingZoneFormProps {
  zone: AdminShippingZone | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ShippingZoneForm({
  zone,
  onClose,
  onSaved,
}: ShippingZoneFormProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShippingZoneFormData>({
    resolver: zodResolver(shippingZoneFormSchema),
    defaultValues: {
      name: zone?.name ?? "",
      description: zone?.description ?? "",
      price: zone?.price != null ? String(zone.price) : "",
      sortOrder: zone?.sortOrder != null ? String(zone.sortOrder) : "0",
      isActive: zone?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: ShippingZoneFormData) => {
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      price: parseInt(data.price, 10),
      sortOrder: parseInt(data.sortOrder || "0", 10),
      ...(zone ? { isActive: data.isActive } : {}),
    };

    const res = zone
      ? await apiPatch(`/api/admin/shipping-zones/${zone.id}`, payload)
      : await apiPost("/api/admin/shipping-zones", payload);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }

    toast.success(zone ? "Zona berhasil diperbarui" : "Zona berhasil dibuat");
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
            {zone ? "Edit Zona Pengiriman" : "Tambah Zona Pengiriman Baru"}
          </h2>
          <p className="text-xs text-warm-gray font-medium mt-1">
            Atur biaya pengiriman berdasarkan area di bawah ini.
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
                Nama Zona
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: Dalam Kota"
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Deskripsi (opsional)
              </label>
              <input
                {...register("description")}
                placeholder="Contoh: Pengiriman area Jabodetabek"
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Harga Ongkir (Rp)
                </label>
                <input
                  type="number"
                  {...register("price")}
                  placeholder="15000"
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
                {errors.price && (
                  <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Urutan
                </label>
                <input
                  type="number"
                  {...register("sortOrder")}
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Zona Aktif</p>
                <p className="text-[10px] text-warm-gray">Aktifkan untuk digunakan pelanggan</p>
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
            {zone ? "Simpan Perubahan" : "Buat Zona"}
          </button>
        </div>
      </form>
    </div>
  );
}