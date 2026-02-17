"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminShippingZone } from "@/types/api";

interface ShippingZoneFormProps {
  open: boolean;
  zone: AdminShippingZone | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ShippingZoneForm({
  open,
  zone,
  onClose,
  onSaved,
}: ShippingZoneFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setDescription(zone.description ?? "");
      setPrice(String(zone.price));
      setSortOrder(String(zone.sortOrder));
      setIsActive(zone.isActive);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setSortOrder("0");
      setIsActive(true);
    }
  }, [zone, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga harus berupa angka >= 0");
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceNum,
      sortOrder: parseInt(sortOrder, 10) || 0,
      ...(zone ? { isActive } : {}),
    };

    setLoading(true);

    const res = zone
      ? await apiPatch(`/api/admin/shipping-zones/${zone.id}`, data)
      : await apiPost("/api/admin/shipping-zones", data);

    setLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error || "Gagal menyimpan");
      return;
    }

    toast.success(zone ? "Zona berhasil diperbarui" : "Zona berhasil dibuat");
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[32px] bg-white shadow-2xl ring-1 ring-warm-sand/30 animate-fade-in-up">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="font-display text-xl font-extrabold text-dark-brown">
            {zone ? "Edit Zona Pengiriman" : "Tambah Zona Pengiriman"}
          </h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-warm-sand transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
              Nama Zona
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Dalam Kota"
              className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
              Deskripsi (opsional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pengiriman area Jabodetabek"
              className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Harga Ongkir (Rp)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                placeholder="15000"
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Urutan
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                min={0}
                className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
            </div>
          </div>

          {zone && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded-lg accent-terracotta"
              />
              <span className="text-sm font-bold text-dark-brown">Aktif</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-cream py-3.5 font-bold text-sm text-warm-gray hover:bg-warm-sand transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-terracotta py-3.5 font-bold text-sm text-white shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {zone ? "Simpan Perubahan" : "Buat Zona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
