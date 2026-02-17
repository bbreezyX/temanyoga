"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";

type SettingsMap = Record<string, string>;

export function PaymentSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SettingsMap>("/api/admin/settings");
    if (res.success) {
      setBankName(res.data.bank_name || "");
      setAccountNumber(res.data.bank_account_number || "");
      setAccountName(res.data.bank_account_name || "");
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
      bank_name: bankName.trim(),
      bank_account_number: accountNumber.trim(),
      bank_account_name: accountName.trim(),
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Pengaturan pembayaran berhasil disimpan");
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
      {/* Bank Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
            Nama Bank
          </label>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Contoh: BCA, Mandiri, BNI"
            className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
          />
        </div>

        {/* Account Number */}
        <div className="space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
            Nomor Rekening
          </label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="1234567890"
            className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
          />
        </div>
      </div>

      {/* Account Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray">
          Nama Pemilik Rekening
        </label>
        <input
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Nama Sesuai Buku Tabungan"
          className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
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
