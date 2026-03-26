"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";

type SettingsMap = Record<string, string>;

export function OriginVillageCodeSetting() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originVillageCode, setOriginVillageCode] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setOriginVillageCode(res.data.origin_village_code || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchSettings, 0);
    return () => clearTimeout(timeout);
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);

    const res = await apiPatch<SettingsMap>("/api/admin/settings", {
      origin_village_code: originVillageCode.trim(),
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Kode kelurahan asal berhasil disimpan");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8">
        <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
        <span className="text-sm text-warm-gray">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <label
          htmlFor="origin_village_code"
          className="text-xs font-bold text-warm-gray uppercase tracking-wider"
        >
          Kode Kelurahan Asal (Origin Village Code)
        </label>
        <input
          id="origin_village_code"
          type="text"
          value={originVillageCode}
          onChange={(e) => setOriginVillageCode(e.target.value)}
          placeholder="Contoh: 3204282001"
          maxLength={10}
          className="h-12 w-full max-w-xs rounded-xl bg-cream/30 border border-warm-sand/40 px-4 text-sm text-dark-brown placeholder:text-warm-gray/60 focus:outline-none focus:border-terracotta transition-all font-medium"
        />
        <p className="text-xs text-warm-gray">
          Kode 10 digit kelurahan asal pengiriman. Digunakan untuk menghitung ongkos kirim otomatis.
          Dapatkan dari{" "}
          <a
            href="https://wilayah.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-terracotta hover:underline"
          >
            wilayah.id
          </a>
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-white font-bold text-sm shadow-lg shadow-terracotta/10 hover:shadow-terracotta/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Simpan
      </button>
    </div>
  );
}
