"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { AdminAccessory } from "@/types/api";

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
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [groupName, setGroupName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (accessory) {
        setName(accessory.name);
        setDescription(accessory.description || "");
        setPrice(String(accessory.price));
        setGroupName(accessory.groupName || "");
        setSortOrder(String(accessory.sortOrder));
        setIsActive(accessory.isActive);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setGroupName("");
        setSortOrder("0");
        setIsActive(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [accessory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga harus berupa angka >= 0");
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      price: priceNum,
      groupName: groupName.trim() || null,
      sortOrder: parseInt(sortOrder, 10) || 0,
      ...(accessory ? { isActive } : {}),
    };

    setLoading(true);

    const res = accessory
      ? await apiPatch(`/api/admin/accessories/${accessory.id}`, data)
      : await apiPost("/api/admin/accessories", data);

    setLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error || "Gagal menyimpan");
      return;
    }

    toast.success(
      accessory ? "Aksesoris berhasil diperbarui" : "Aksesoris berhasil dibuat"
    );
    onSaved();
    onClose();
  }

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
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-warm-gray hover:text-red-500 shadow-sm transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Nama Aksesoris
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Contoh: Tatakan Kayu Jati"
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Deskripsi (opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat aksesoris"
                rows={3}
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none"
              />
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                  placeholder="10000"
                  className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  min={0}
                  className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
                Nama Grup (opsional)
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
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
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
          <button
            type="button"
            onClick={onClose}
            className="order-2 sm:order-1 px-8 py-3.5 font-bold text-sm text-warm-gray hover:bg-warm-sand/30 rounded-full transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="order-1 sm:order-2 px-10 py-3.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {accessory ? "Simpan Perubahan" : "Buat Aksesoris"}
          </button>
        </div>
      </form>
    </div>
  );
}
