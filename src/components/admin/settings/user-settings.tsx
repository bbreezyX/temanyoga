"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPatch } from "@/lib/api-client";
import type { AdminUser } from "@/types/api";

interface UserSettingsProps {
  onSaved?: () => void;
}

export function UserSettings({ onSaved }: UserSettingsProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminUser[]>("/api/admin/users");
    if (res.success && res.data.length > 0) {
      const currentUser = res.data.find((u) => u.role === "ADMIN") || res.data[0];
      setUser(currentUser);
      setEmail(currentUser.email);
      setName(currentUser.name);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUser, 0);
    return () => clearTimeout(timeout);
  }, [fetchUser]);

  async function handleSave() {
    if (!email.trim()) {
      toast.error("Email tidak boleh kosong");
      return;
    }
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setSaving(true);

    const res = await apiPatch<AdminUser>("/api/admin/users", {
      id: user?.id,
      email: email.trim(),
      name: name.trim(),
      password: password || undefined,
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan perubahan");
      return;
    }

    toast.success("Profil berhasil diperbarui");
    setPassword("");
    if (res.data) {
      setUser(res.data);
      setEmail(res.data.email);
      setName(res.data.name);
    }
    onSaved?.();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <span className="text-sm font-medium text-warm-gray">Memuat profil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-cream/50 rounded-2xl ring-1 ring-warm-sand/20">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-terracotta/10 ring-1 ring-terracotta/20">
          <User className="h-7 w-7 text-terracotta" />
        </div>
        <div>
          <p className="font-display font-bold text-dark-brown">{user?.name}</p>
          <p className="text-xs text-warm-gray">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Nama
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full rounded-2xl bg-cream px-5 py-3.5 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Password Baru
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kosongkan jika tidak ingin mengubah password"
            className="w-full rounded-2xl bg-cream px-5 py-3.5 pr-12 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-dark-brown transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-warm-gray">Minimal 6 karakter. Kosongkan jika tidak ingin mengubah password.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-warm-sand/30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}