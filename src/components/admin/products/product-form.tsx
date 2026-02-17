"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { ProductListItem } from "@/types/api";

const productFormSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(200, "Nama maksimal 200 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  price: z.string().min(1, "Harga wajib diisi").refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    "Harga harus berupa angka positif"
  ),
  stock: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: ProductListItem | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({
  product,
  open,
  onClose,
  onSaved,
}: ProductFormProps) {
  const toast = useToast();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ? String(product.price) : "",
      stock: product?.stock != null ? String(product.stock) : "",
      isActive: product?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: parseInt(data.price, 10),
      stock: data.stock?.trim() ? parseInt(data.stock, 10) : null,
      ...(isEdit ? { isActive: data.isActive } : {}),
    };

    const res = isEdit
      ? await apiPatch(`/api/admin/products/${product.id}`, payload)
      : await apiPost("/api/admin/products", payload);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil dibuat");
    onSaved();
    onClose();
    reset();
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-dark-brown">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
          <p className="text-sm text-warm-gray font-medium mt-1">
            {isEdit
              ? "Perbarui informasi produk di bawah ini."
              : "Isi detail produk baru di bawah ini."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-[12px] font-black uppercase tracking-[0.08em] text-warm-gray"
            >
              Nama Produk *
            </label>
            <input
              id="name"
              {...register("name")}
              className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
              placeholder="Contoh: Yoga Mat Premium"
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-[12px] font-black uppercase tracking-[0.08em] text-warm-gray"
            >
              Deskripsi *
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none placeholder:text-warm-gray/50"
              placeholder="Deskripsikan produk Anda..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-[12px] font-black uppercase tracking-[0.08em] text-warm-gray"
              >
                Harga (IDR) *
              </label>
              <input
                id="price"
                type="number"
                {...register("price")}
                className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
                placeholder="0"
              />
              {errors.price && (
                <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="stock"
                className="text-[12px] font-black uppercase tracking-[0.08em] text-warm-gray"
              >
                Stok
              </label>
              <input
                id="stock"
                type="number"
                {...register("stock")}
                className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
                placeholder="Kosongkan = unlimited"
              />
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">
                  Status Produk
                </p>
                <p className="text-[11px] text-warm-gray">
                  Produk aktif akan tampil di toko
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-full px-6 py-3 text-sm font-bold text-warm-gray hover:bg-cream transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm text-white font-bold shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30 hover:scale-[1.03] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Buat Produk"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}