"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const name = (form.get("name") as string).trim();
    const description = (form.get("description") as string).trim();
    const price = Number(form.get("price"));
    const stockStr = (form.get("stock") as string).trim();
    const stock = stockStr === "" ? null : Number(stockStr);
    const isActive = form.get("isActive") === "on";

    if (!name || !description || !price || price <= 0) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setLoading(true);

    if (isEdit) {
      const res = await apiPatch(`/api/admin/products/${product.id}`, {
        name,
        description,
        price,
        stock,
        isActive,
      });
      setLoading(false);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Produk berhasil diperbarui");
    } else {
      const res = await apiPost("/api/admin/products", {
        name,
        description,
        price,
        stock,
      });
      setLoading(false);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Produk berhasil dibuat");
    }

    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
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

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
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
              name="name"
              defaultValue={product?.name ?? ""}
              required
              className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
              placeholder="Contoh: Yoga Mat Premium"
            />
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
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              required
              className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none placeholder:text-warm-gray/50"
              placeholder="Deskripsikan produk Anda..."
            />
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
                name="price"
                type="number"
                min={1}
                defaultValue={product?.price ?? ""}
                required
                className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
                placeholder="0"
              />
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
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? ""}
                className="w-full rounded-xl bg-cream px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 outline-none focus:ring-2 focus:ring-terracotta/40 transition-all placeholder:text-warm-gray/50"
                placeholder="Kosongkan = unlimited"
              />
            </div>
          </div>

          {/* Active Toggle */}
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
                id="isActive"
                name="isActive"
                defaultChecked={product.isActive}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-3 text-sm font-bold text-warm-gray hover:bg-cream transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm text-white font-bold shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30 hover:scale-[1.03] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Buat Produk"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
