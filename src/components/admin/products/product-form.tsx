"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { Loader2, ImagePlus, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost, apiPatch, apiDelete, apiUpload } from "@/lib/api-client";
import { getImageUrl } from "@/lib/image-url";
import Image from "next/image";
import type { AdminProductListItem, ProductImage } from "@/types/api";

const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama produk wajib diisi")
    .max(200, "Nama maksimal 200 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  price: z
    .string()
    .min(1, "Harga wajib diisi")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
      "Harga harus berupa angka positif",
    ),
  stock: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// A pending file not yet uploaded (only during create flow)
interface PendingFile {
  id: string; // local temp id
  file: File;
  preview: string;
}

interface ProductFormProps {
  product?: AdminProductListItem | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function ProductForm({
  product,
  open,
  onClose,
  onSaved,
}: ProductFormProps) {
  const toast = useToast();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Edit mode: images already saved in DB
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Create mode: files queued locally, uploaded after product is created
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
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

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? "",
        description: product?.description ?? "",
        price: product?.price ? String(product.price) : "",
        stock: product?.stock != null ? String(product.stock) : "",
        isActive: product?.isActive ?? true,
      });
      setExistingImages(product?.images ?? []);
      setPendingFiles([]);
    }
  }, [open, product, reset]);

  // Cleanup object URLs on unmount / close
  useEffect(() => {
    return () => {
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [pendingFiles]);

  const isActive = useWatch({ control, name: "isActive" });

  // ─── File handling ────────────────────────────────────────────────────────

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid = arr.filter((f) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
          toast.error(`${f.name}: hanya JPEG, PNG, atau WebP`);
          return false;
        }
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`${f.name}: ukuran maksimal 5MB`);
          return false;
        }
        return true;
      });

      if (isEdit) {
        // In edit mode: upload immediately
        valid.forEach((file) => uploadImageForProduct(file));
      } else {
        // In create mode: queue locally
        const newPending: PendingFile[] = valid.map((file) => ({
          id: Math.random().toString(36).slice(2),
          file,
          preview: URL.createObjectURL(file),
        }));
        setPendingFiles((prev) => [...prev, ...newPending]);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit, product?.id],
  );

  const uploadImageForProduct = useCallback(
    async (file: File) => {
      if (!product?.id) return;
      const res = await apiUpload<ProductImage>(
        `/api/admin/products/${product.id}/images`,
        file,
      );
      if (!res.success) {
        toast.error(`Gagal upload ${file.name}: ${res.error}`);
        return;
      }
      setExistingImages((prev) => [...prev, res.data]);
      toast.success(`${file.name} berhasil diunggah`);
    },
    [product?.id, toast],
  );

  const removePending = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const removeExisting = useCallback(
    async (imageId: string) => {
      setDeletingImageId(imageId);
      const res = await apiDelete(
        `/api/admin/products/images/${imageId}`,
      );
      setDeletingImageId(null);
      if (!res.success) {
        toast.error("Gagal hapus foto");
        return;
      }
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    },
    [toast],
  );

  // ─── Drag & drop ──────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: parseInt(data.price, 10),
      stock: data.stock?.trim() ? parseInt(data.stock, 10) : null,
      ...(isEdit ? { isActive: data.isActive } : {}),
    };

    if (isEdit) {
      const res = await apiPatch(`/api/admin/products/${product.id}`, payload);
      if (!res.success) { toast.error(res.error); return; }
    } else {
      const res = await apiPost<{ id: string }>("/api/admin/products", payload);
      if (!res.success) { toast.error(res.error); return; }

      // Upload queued photos after product creation
      if (pendingFiles.length > 0) {
        const productId = res.data.id;
        const results = await Promise.allSettled(
          pendingFiles.map((pf) =>
            apiUpload(`/api/admin/products/${productId}/images`, pf.file),
          ),
        );
        const failed = results.filter(
          (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success),
        ).length;
        if (failed > 0) {
          toast.error(`${failed} foto gagal diunggah, cek produk untuk menambah ulang`);
        }
        pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      }
    }

    toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil dibuat");
    await onSaved();
    onClose();
    reset();
    setPendingFiles([]);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      reset();
      setPendingFiles([]);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const totalImages = existingImages.length + pendingFiles.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-dark-brown">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
          <p className="text-sm text-warm-gray font-medium mt-1">
            {isEdit
              ? "Perbarui informasi dan foto produk."
              : "Isi detail produk dan pilih foto sekaligus."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Name */}
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
              placeholder="Contoh: Boneka Yoga Premium"
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
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
              <p className="text-xs text-red-500 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price & Stock */}
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
                <p className="text-xs text-red-500 font-medium">
                  {errors.price.message}
                </p>
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

          {/* Status toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Status Produk</p>
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

          {/* ── Photo section ─────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-black uppercase tracking-[0.08em] text-warm-gray">
                Foto Produk
                {totalImages > 0 && (
                  <span className="ml-2 normal-case font-bold text-terracotta">
                    {totalImages} foto
                  </span>
                )}
              </label>
              {isEdit && (
                <p className="text-[11px] text-warm-gray">
                  Foto pertama jadi cover
                </p>
              )}
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                isDragging
                  ? "border-terracotta bg-terracotta/5 scale-[1.01]"
                  : "border-warm-sand/60 bg-cream/50 hover:border-terracotta/50 hover:bg-cream"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-sand/30">
                <ImagePlus className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark-brown">
                  {isDragging ? "Lepaskan file di sini" : "Klik atau seret foto"}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">
                  JPEG, PNG, WebP · Maks. 5MB · Bisa pilih banyak sekaligus
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* Existing images (edit mode) */}
            {isEdit && existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((img, i) => (
                  <div key={img.id} className="group relative aspect-square">
                    <Image
                      src={getImageUrl(img.url)}
                      alt={`Foto ${i + 1}`}
                      fill
                      className="rounded-xl object-cover"
                      sizes="120px"
                    />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-terracotta/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExisting(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-50"
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending files (create mode) */}
            {!isEdit && pendingFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {pendingFiles.map((pf, i) => (
                  <div key={pf.id} className="group relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pf.preview}
                      alt={pf.file.name}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-terracotta/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePending(pf.id)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="truncate rounded bg-black/50 px-1 py-0.5 text-[9px] text-white">
                        {pf.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress hint for edit mode */}
            {isEdit && (
              <p className="text-[11px] text-warm-gray">
                Foto diunggah langsung saat kamu pilih. Foto pertama otomatis jadi cover.
              </p>
            )}
            {!isEdit && pendingFiles.length > 0 && (
              <p className="text-[11px] text-warm-gray">
                {pendingFiles.length} foto akan diunggah saat produk disimpan.
              </p>
            )}
          </div>

          {/* Actions */}
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
              {isSubmitting
                ? isEdit
                  ? "Menyimpan..."
                  : "Membuat produk..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Produk"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
