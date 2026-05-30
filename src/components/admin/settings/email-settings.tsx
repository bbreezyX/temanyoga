"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, Send, Mail } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import {
  DEFAULT_EMAIL_FROM,
  DEFAULT_EMAIL_REPLY_TO,
  EMAIL_DOMAIN,
  usesLegacyEmailDomain,
} from "@/lib/email-config";

type SettingsMap = Record<string, string>;

export function EmailSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [emailFrom, setEmailFrom] = useState(DEFAULT_EMAIL_FROM);
  const [emailReplyTo, setEmailReplyTo] = useState(DEFAULT_EMAIL_REPLY_TO);
  const [testEmail, setTestEmail] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setEnabled(res.data.email_enabled === "true");
      setEmailFrom(res.data.email_from || DEFAULT_EMAIL_FROM);
      setEmailReplyTo(res.data.email_reply_to || DEFAULT_EMAIL_REPLY_TO);
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
      email_from: emailFrom.trim(),
      email_reply_to: emailReplyTo.trim(),
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Pengaturan email berhasil disimpan");
  }

  async function handleTestEmail() {
    const email = testEmail.trim();
    if (!email) {
      toast.error("Masukkan alamat email tujuan tes");
      return;
    }

    setTesting(true);
    const res = await apiPost<{ message: string }>("/api/admin/email-test", {
      email,
    });
    setTesting(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengirim email tes");
      return;
    }

    toast.success(res.data.message);
  }

  const hasLegacyDomain =
    usesLegacyEmailDomain(emailFrom) || usesLegacyEmailDomain(emailReplyTo);

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
      {hasLegacyDomain ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-950">
          <p className="font-bold">Domain pengirim masih ditemaniyoga.com</p>
          <p className="mt-1 text-xs leading-6">
            Ganti ke{" "}
            <span className="font-mono font-semibold">{EMAIL_DOMAIN}</span> lalu
            simpan. Domain lama tidak terverifikasi di Resend.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
        <p className="font-bold">Setup Resend — {EMAIL_DOMAIN}</p>
        <p className="mt-1 text-xs leading-6 text-amber-900/90">
          Domain <span className="font-mono font-semibold">{EMAIL_DOMAIN}</span>{" "}
          sudah didaftarkan di Resend. Tambahkan record DNS di registrar domain
          Anda, lalu verifikasi di dashboard Resend sebelum mengaktifkan
          notifikasi. Panduan lengkap:{" "}
          <code className="rounded bg-white/70 px-1 py-0.5 text-[11px]">
            docs/RESEND-SETUP.md
          </code>
        </p>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-cream px-5 py-3.5 ring-1 ring-warm-sand/50">
        <div>
          <p className="text-sm font-bold text-dark-brown">
            Aktifkan Notifikasi Email
          </p>
          <p className="text-[10px] text-warm-gray">
            Kirim notifikasi otomatis ke pelanggan via Resend
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings/email-preview"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-warm-sand/50 text-[10px] font-bold text-terracotta hover:bg-warm-sand/10 transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>Preview Template</span>
          </Link>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="email_from"
            className="text-xs font-bold text-warm-gray uppercase tracking-wider"
          >
            Pengirim (From)
          </label>
          <input
            id="email_from"
            type="text"
            value={emailFrom}
            onChange={(e) => setEmailFrom(e.target.value)}
            placeholder={DEFAULT_EMAIL_FROM}
            className="h-12 w-full rounded-xl bg-cream/30 border border-warm-sand/40 px-4 text-sm text-dark-brown placeholder:text-warm-gray/60 focus:outline-none focus:border-terracotta transition-all font-medium"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email_reply_to"
            className="text-xs font-bold text-warm-gray uppercase tracking-wider"
          >
            Reply-To
          </label>
          <input
            id="email_reply_to"
            type="email"
            value={emailReplyTo}
            onChange={(e) => setEmailReplyTo(e.target.value)}
            placeholder={DEFAULT_EMAIL_REPLY_TO}
            className="h-12 w-full rounded-xl bg-cream/30 border border-warm-sand/40 px-4 text-sm text-dark-brown placeholder:text-warm-gray/60 focus:outline-none focus:border-terracotta transition-all font-medium"
          />
        </div>
      </div>

      <p className="text-[10px] text-warm-gray">
        Wajib set env{" "}
        <span className="font-mono font-bold">RESEND_API_KEY</span> di Railway /
        lokal. Domain pengirim harus terverifikasi di Resend.
      </p>

      <div className="rounded-2xl bg-cream/30 px-5 py-4 ring-1 ring-warm-sand/30">
        <div className="flex items-center gap-2 text-sm font-bold text-dark-brown">
          <Mail className="h-4 w-4 text-terracotta" />
          Kirim Email Tes
        </div>
        <p className="mt-1 text-[10px] text-warm-gray">
          Tes koneksi Resend (tidak perlu toggle aktif). Gagal jika DNS domain
          belum diverifikasi.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-11 min-w-[240px] flex-1 rounded-xl border border-warm-sand/40 bg-white px-4 text-sm text-dark-brown focus:outline-none focus:border-terracotta"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testing}
            className="flex h-11 items-center gap-2 rounded-full bg-dark-brown px-5 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Kirim Tes
          </button>
        </div>
      </div>

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
