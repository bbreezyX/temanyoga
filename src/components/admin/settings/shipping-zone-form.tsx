"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminShippingZone } from "@/types/api";

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
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 0);
    return () => clearTimeout(timer);
  }, [zone]);

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
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Deskripsi (opsional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                  placeholder="15000"
                  className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
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

            <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
              <div>
                <p className="text-sm font-bold text-dark-brown">Zona Aktif</p>
                <p className="text-[10px] text-warm-gray">Aktifkan untuk digunakan pelanggan</p>
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
            {zone ? "Simpan Perubahan" : "Buat Zona"}
          </button>
        </div>
      </form>
    </div>
  );
}
