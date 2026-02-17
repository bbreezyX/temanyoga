"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";

type SettingsMap = Record<string, string>;

export function EmailSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setEnabled(res.data.email_enabled === "true");
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
      email_enabled: enabled ? "true" : "false",
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Pengaturan email berhasil disimpan");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <span className="text-sm font-medium text-warm-gray">
          Memuat pengaturan...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
        <div>
          <p className="text-sm font-bold text-dark-brown">
            Aktifkan Notifikasi Email
          </p>
          <p className="text-[10px] text-warm-gray">
            Kirim notifikasi otomatis ke pelanggan via email (Resend)
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <p className="text-[10px] text-warm-gray">
        Pastikan <span className="font-mono font-bold">RESEND_API_KEY</span>{" "}
        sudah diset di environment variables dan domain sudah diverifikasi di
        Resend.
      </p>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-warm-sand/30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
