"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminAccessory } from "@/types/api";

const accessoryFormSchema = z.object({
  name: z.string().min(1, "Nama aksesoris wajib diisi").max(200, "Nama maksimal 200 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  price: z.string().refine(
    (val) => val !== "" && !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
    "Harga harus berupa angka >= 0"
  ),
  groupName: z.string().max(100, "Nama grup maksimal 100 karakter").optional(),
  sortOrder: z.string().refine(
    (val) => val === "" || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0),
    "Urutan harus berupa angka >= 0"
  ).optional(),
  isActive: z.boolean(),
});

type AccessoryFormData = z.infer<typeof accessoryFormSchema>;

interface AccessoryFormProps {
  accessory: AdminAccessory | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AccessoryForm({
  accessory,
  onClose,
  onSaved,
}: AccessoryFormProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccessoryFormData>({
    resolver: zodResolver(accessoryFormSchema),
    defaultValues: {
      name: accessory?.name ?? "",
      description: accessory?.description ?? "",
      price: accessory?.price != null ? String(accessory.price) : "",
      groupName: accessory?.groupName ?? "",
      sortOrder: accessory?.sortOrder != null ? String(accessory.sortOrder) : "0",
      isActive: accessory?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: AccessoryFormData) => {
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: parseInt(data.price, 10),
      groupName: data.groupName?.trim() || null,
      sortOrder: parseInt(data.sortOrder || "0", 10),
      ...(accessory ? { isActive: data.isActive } : {}),
    };

    const res = accessory
      ? await apiPatch(`/api/admin/accessories/${accessory.id}`, payload)
      : await apiPost("/api/admin/accessories", payload);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }

    toast.success(accessory ? "Aksesoris berhasil diperbarui" : "Aksesoris berhasil dibuat");
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
            {accessory ? "Edit Aksesoris" : "Tambah Aksesoris Baru"}
          </h2>
          <p className="text-xs text-warm-gray font-medium mt-1">
            Isi detail aksesoris add-on di bawah ini.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-warm-gray hover:text-red-500 shadow-sm transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Nama Aksesoris
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: Tatakan Kayu Jati"
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Deskripsi (opsional)
              </label>
              <textarea
                {...register("description")}
                placeholder="Deskripsi singkat aksesoris"
                rows={3}
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  {...register("price")}
                  placeholder="10000"
                  className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
                {errors.price && (
                  <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  {...register("sortOrder")}
                  className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Nama Grup (opsional)
              </label>
              <input
                {...register("groupName")}
                placeholder="Misal: Pilihan Tatakan"
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
              <p className="text-[10px] text-warm-gray/70 leading-tight mt-1 px-1">
                Gunakan nama grup yang sama untuk membuat pilihan radio (pilih salah satu).
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3.5 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Status Aktif</p>
                <p className="text-[10px] text-warm-gray">Munculkan di toko</p>
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
            className="order-2 sm:order-1 px-8 py-3.5 font-bold text-sm text-warm-gray hover:bg-warm-sand/30 rounded-full transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="order-1 sm:order-2 px-10 py-3.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {accessory ? "Simpan Perubahan" : "Buat Aksesoris"}
          </button>
        </div>
      </form>
    </div>
  );
}