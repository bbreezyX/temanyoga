"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Harga (IDR) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={1}
                defaultValue={product?.price ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stok (kosongkan = unlimited)</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? ""}
              />
            </div>
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={product.isActive}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan" : "Buat Produk"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
