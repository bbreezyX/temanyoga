"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";
import {
  WilayahVillagePicker,
  type WilayahVillageSelection,
  type VerifyVillageCodeResult,
} from "@/components/wilayah/wilayah-village-picker";
import { verifyVillageCode } from "@/lib/resolve-wilayah-village";
import { isValidVillageCode, normalizeVillageCode } from "@/lib/village-code";

type SettingsMap = Record<string, string>;

const EMPTY_SELECTION: WilayahVillageSelection = {
  province: null,
  regency: null,
  district: null,
  village: null,
};

export function OriginVillageCodeSetting() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [originVillageCode, setOriginVillageCode] = useState("");
  const [selection, setSelection] = useState<WilayahVillageSelection>(EMPTY_SELECTION);
  const [useManualInput, setUseManualInput] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setOriginVillageCode(res.data.origin_village_code || "");
      setCodeVerified(false);
      setSelection(EMPTY_SELECTION);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchSettings, 0);
    return () => clearTimeout(timeout);
  }, [fetchSettings]);

  function handlePickerChange(
    nextSelection: WilayahVillageSelection,
    normalizedVillageCode: string | null,
  ) {
    setSelection(nextSelection);
    if (normalizedVillageCode) {
      setOriginVillageCode(normalizedVillageCode);
      setUseManualInput(false);
      setCodeVerified(true);
    }
  }

  function handleVerifyResult(result: VerifyVillageCodeResult) {
    if (result.status === "found") {
      setCodeVerified(true);
      return;
    }

    setCodeVerified(false);

    if (result.status === "not_found") {
      toast.error(result.message);
      return;
    }

    if (result.status === "invalid") {
      toast.error(result.message);
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
    }
  }

  async function handleVerifyManualCode() {
    const trimmed = originVillageCode.trim();
    if (!trimmed) {
      toast.error("Masukkan kode kelurahan terlebih dahulu");
      return;
    }

    setVerifying(true);
    const result = await verifyVillageCode(trimmed);
    setVerifying(false);

    if (result.status === "found") {
      setSelection(result.selection);
      setOriginVillageCode(result.normalized);
      setCodeVerified(true);
      toast.success(`Kode ${result.normalized} ditemukan`);
      return;
    }

    setCodeVerified(false);
    setSelection(EMPTY_SELECTION);
    toast.error(result.message);
  }

  async function handleSave() {
    const trimmed = originVillageCode.trim();
    if (!trimmed) {
      toast.error("Kode kelurahan wajib diisi");
      return;
    }

    if (!isValidVillageCode(trimmed)) {
      toast.error("Kode kelurahan harus 10 digit angka");
      return;
    }

    const normalized = normalizeVillageCode(trimmed);
    const pickerMatches =
      selection.village &&
      normalizeVillageCode(selection.village.code) === normalized;

    if (!pickerMatches) {
      setVerifying(true);
      const result = await verifyVillageCode(trimmed);
      setVerifying(false);

      if (result.status !== "found") {
        toast.error(result.message);
        setCodeVerified(false);
        return;
      }

      setSelection(result.selection);
      setOriginVillageCode(result.normalized);
    }

    setSaving(true);

    const res = await apiPatch<SettingsMap>("/api/admin/settings", {
      origin_village_code: normalized,
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    if (res.data.origin_village_code) {
      setOriginVillageCode(res.data.origin_village_code);
    }

    setCodeVerified(true);
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
      <div className="grid gap-4">
        <div>
          <p className="text-sm font-semibold text-dark-brown">
            Pilih kelurahan asal pengiriman
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            Kode diambil langsung dari API wilayah internal. Jika kode tidak ada
            di database, sistem menampilkan notifikasi &quot;tidak ditemukan&quot;.
          </p>
        </div>

        <WilayahVillagePicker
          value={selection}
          onChange={handlePickerChange}
          onVerifyResult={handleVerifyResult}
          initialVillageCode={originVillageCode}
          variant="admin"
        />
      </div>

      <div className="space-y-3 border-t border-warm-sand/30 pt-5">
        <button
          type="button"
          onClick={() => setUseManualInput((prev) => !prev)}
          className="text-xs font-semibold text-terracotta hover:underline"
        >
          {useManualInput ? "Sembunyikan input manual" : "Input kode manual"}
        </button>

        {useManualInput && (
          <div className="grid gap-3">
            <label
              htmlFor="origin_village_code"
              className="text-xs font-bold text-warm-gray uppercase tracking-wider"
            >
              Kode Kelurahan (Manual)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="origin_village_code"
                type="text"
                value={originVillageCode}
                onChange={(e) => {
                  setOriginVillageCode(e.target.value);
                  setCodeVerified(false);
                }}
                placeholder="Contoh: 3204282001 atau 32.04.28.2001"
                maxLength={15}
                className="h-12 w-full max-w-xs rounded-xl bg-cream/30 border border-warm-sand/40 px-4 text-sm text-dark-brown placeholder:text-warm-gray/60 focus:outline-none focus:border-terracotta transition-all font-medium font-mono"
              />
              <button
                type="button"
                onClick={handleVerifyManualCode}
                disabled={verifying || !originVillageCode.trim()}
                className="flex h-12 items-center gap-2 rounded-xl border border-warm-sand/40 bg-white px-4 text-sm font-semibold text-dark-brown transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-50"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Verifikasi
              </button>
            </div>
            <p className="text-xs text-warm-gray">
              Kode manual wajib diverifikasi ke API wilayah sebelum disimpan.
            </p>
          </div>
        )}

        {!useManualInput && originVillageCode && (
          <p className="text-xs text-warm-gray">
            Kode tersimpan:{" "}
            <span className="font-mono font-semibold text-dark-brown">
              {originVillageCode}
            </span>
            {codeVerified ? (
              <span className="ml-2 font-semibold text-emerald-700">
                (Terverifikasi)
              </span>
            ) : null}
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || verifying || !originVillageCode.trim()}
        className="flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-white font-bold text-sm shadow-lg shadow-terracotta/10 hover:shadow-terracotta/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {(saving || verifying) && <Loader2 className="h-4 w-4 animate-spin" />}
        Simpan
      </button>
    </div>
  );
}
