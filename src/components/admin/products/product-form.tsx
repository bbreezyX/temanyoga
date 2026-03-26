"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { Loader2, ImagePlus, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-lift bg-white focus:outline-none">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black tracking-tight text-dark-brown">
              {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <p className="text-xs text-warm-gray font-semibold mt-1.5 opacity-80">
              {isEdit
                ? "Perbarui informasi dan foto koleksi boneka Anda."
                : "Isi detail produk dan pilih foto produk sekaligus."}
            </p>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-2 pb-8">
            {/* Name */}
            <div className="space-y-2.5">
              <label
                htmlFor="name"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray/70 ml-1"
              >
                Nama Produk *
              </label>
              <input
                id="name"
                {...register("name")}
                className="w-full h-12 rounded-2xl bg-cream/60 px-5 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/30 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/30"
                placeholder="Contoh: Boneka Yoga Premium"
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 font-bold ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <label
                htmlFor="description"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray/70 ml-1"
              >
                Deskripsi Cerita *
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full rounded-2xl bg-cream/60 px-5 py-4 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/30 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none placeholder:text-warm-gray/30"
                placeholder="Ceritakan detail produk ini..."
              />
              {errors.description && (
                <p className="text-[11px] text-red-500 font-bold ml-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label
                  htmlFor="price"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray/70 ml-1"
                >
                  Harga (IDR) *
                </label>
                <input
                  id="price"
                  type="number"
                  {...register("price")}
                  className="w-full h-12 rounded-2xl bg-cream/60 px-5 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/30 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/30"
                  placeholder="0"
                />
                {errors.price && (
                  <p className="text-[11px] text-red-500 font-bold ml-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2.5">
                <label
                  htmlFor="stock"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray/70 ml-1"
                >
                  Stok Unit
                </label>
                <input
                  id="stock"
                  type="number"
                  {...register("stock")}
                  className="w-full h-12 rounded-2xl bg-cream/60 px-5 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/30 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/30"
                  placeholder="Unlimited"
                />
              </div>
            </div>

            {/* Status toggle (edit only) */}
            {isEdit && (
              <div className="flex items-center justify-between rounded-2xl bg-cream/40 px-5 py-4 ring-1 ring-warm-sand/20">
                <div>
                  <p className="text-[13px] font-black text-dark-brown">Visibility</p>
                  <p className="text-[11px] text-warm-gray font-bold">
                    Tampil di etalase toko
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
              </div>
            )}

            {/* ── Photo section ─────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray/70">
                  Galeri Foto
                  {totalImages > 0 && (
                    <span className="ml-2 normal-case font-black text-terracotta">
                      ({totalImages})
                    </span>
                  )}
                </label>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-3xl border-2 border-dashed px-5 py-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-terracotta bg-terracotta/5 scale-[0.99] shadow-inner"
                    : "border-warm-sand/40 bg-cream/40 hover:border-terracotta/30 hover:bg-cream/60"
                }`}
              >
                <div className="p-3 rounded-2xl bg-white shadow-soft group-hover:scale-110 transition-transform">
                  <ImagePlus className="h-6 w-6 text-terracotta" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-dark-brown">
                    {isDragging ? "Lepaskan sekarang" : "Upload foto produk"}
                  </p>
                  <p className="text-[10px] font-bold text-warm-gray/60 mt-0.5">
                    Maks. 5MB per file · Rekomendasi 1:1
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
                <div className="grid grid-cols-4 gap-2.5">
                  {existingImages.map((img, i) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-warm-sand/20">
                      <Image
                        src={getImageUrl(img.url)}
                        alt={`Foto ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="120px"
                      />
                      {i === 0 && (
                        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-terracotta px-2 py-0.5 text-[9px] font-black text-white shadow-lg">
                          <Star className="h-2 w-2 fill-white" />
                          COVER
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExisting(img.id)}
                        disabled={deletingImageId === img.id}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        {deletingImageId === img.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <div className="bg-red-500 p-1.5 rounded-full hover:scale-110 transition-transform">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending files (create mode) */}
              {!isEdit && pendingFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5">
                  {pendingFiles.map((pf, i) => (
                    <div key={pf.id} className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-warm-sand/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pf.preview}
                        alt={pf.file.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {i === 0 && (
                        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-terracotta px-2 py-0.5 text-[9px] font-black text-white shadow-lg">
                          <Star className="h-2 w-2 fill-white" />
                          COVER
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePending(pf.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-red-500 p-1.5 rounded-full hover:scale-110 transition-transform">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="hidden" id="submit-btn" />
          </form>
        </ScrollArea>

        {/* Actions Bar */}
        <div className="px-6 py-5 border-t border-warm-sand/10 bg-cream/20 flex gap-3 justify-end items-center">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="h-12 px-6 text-xs font-black uppercase tracking-[0.1em] text-warm-gray hover:text-dark-brown hover:bg-cream transition-all rounded-full"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              const btn = document.getElementById('submit-btn');
              if (btn) btn.click();
            }}
            disabled={isSubmitting}
            className="h-12 px-8 rounded-full bg-terracotta text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-terracotta/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Processing..." : isEdit ? "Simpan Perubahan" : "Terbitkan Produk"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
