"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch, apiPost } from "@/lib/api-client";

type SettingsMap = Record<string, string>;

export function WhatsAppSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setEnabled(res.data.whatsapp_enabled === "true");
      setAdminPhone(res.data.whatsapp_admin_phone || "");
      setSiteUrl(res.data.site_url || "");
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
      whatsapp_enabled: enabled ? "true" : "false",
      whatsapp_admin_phone: adminPhone.trim(),
      site_url: siteUrl.trim() || undefined,
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Pengaturan WhatsApp berhasil disimpan");
  }

  async function handleTest() {
    const phone = adminPhone.trim();
    if (!phone) {
      toast.error("Masukkan nomor WhatsApp admin terlebih dahulu");
      return;
    }

    setTesting(true);

    const res = await apiPost<{ message: string }>("/api/admin/settings", {
      phone,
    });

    setTesting(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengirim pesan tes");
      return;
    }

    toast.success("Pesan tes berhasil dikirim!");
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
            Aktifkan Notifikasi WhatsApp
          </p>
          <p className="text-[10px] text-warm-gray">
            Kirim notifikasi otomatis ke pelanggan dan admin via WhatsApp
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Admin Phone */}
      <div className="space-y-1.5">
        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
          Nomor WhatsApp Admin
        </label>
        <input
          value={adminPhone}
          onChange={(e) => setAdminPhone(e.target.value)}
          placeholder="08123456789"
          className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
        />
        <p className="text-[10px] text-warm-gray">
          Nomor ini akan menerima notifikasi pesanan baru dan bukti pembayaran
        </p>
      </div>

      {/* Site URL */}
      <div className="space-y-1.5">
        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
          URL Website
        </label>
        <input
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://temanyoga.com"
          className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
        />
        <p className="text-[10px] text-warm-gray">
          Digunakan untuk link tracking pesanan di pesan WhatsApp
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !adminPhone.trim()}
          className="px-6 py-3 font-bold text-sm text-terracotta bg-cream ring-1 ring-warm-sand/50 rounded-full hover:bg-warm-sand/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Kirim Pesan Tes
        </button>
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
