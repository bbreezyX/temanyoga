"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, User, PlusCircle, Trash2, Shield, UserCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPost, apiDelete } from "@/lib/api-client";
import type { AdminUser } from "@/types/api";

interface UserListProps {
  currentUserId: string;
  onRefresh: () => void;
}

export function UserList({ currentUserId, onRefresh }: UserListProps) {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "CUSTOMER">("ADMIN");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminUser[]>("/api/admin/users");
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate() {
    if (!newEmail.trim() || !newName.trim() || !newPassword.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSaving(true);
    const res = await apiPost<AdminUser>("/api/admin/users", {
      email: newEmail.trim(),
      name: newName.trim(),
      password: newPassword,
      role: newRole,
    });
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menambah pengguna");
      return;
    }

    toast.success("Pengguna berhasil ditambahkan");
    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setNewRole("ADMIN");
    setShowForm(false);
    fetchUsers();
    onRefresh();
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?`)) return;

    setDeleting(userId);
    const res = await apiDelete<{ deleted: boolean }>(`/api/admin/users?id=${userId}`);
    setDeleting(null);

    if (!res.success) {
      toast.error(res.error || "Gagal menghapus pengguna");
      return;
    }

    toast.success("Pengguna berhasil dihapus");
    fetchUsers();
    onRefresh();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <span className="text-sm font-medium text-warm-gray">Memuat pengguna...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-dark-brown">Daftar Pengguna</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-full bg-terracotta px-4 py-2 text-white font-bold text-sm shadow-lg shadow-terracotta/10 hover:shadow-terracotta/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-cream/30 rounded-2xl p-6 ring-1 ring-warm-sand/20 space-y-4 animate-fade-in">
          <h4 className="font-bold text-dark-brown">Tambah Pengguna Baru</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray">Nama</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama pengguna"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "ADMIN" | "CUSTOMER")}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              >
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-6 py-2.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 font-bold text-sm text-warm-gray bg-warm-sand/20 rounded-full hover:bg-warm-sand/30 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-cream/30 rounded-2xl ring-1 ring-warm-sand/20"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center h-11 w-11 rounded-full ${user.role === "ADMIN" ? "bg-terracotta/10 ring-1 ring-terracotta/20" : "bg-sage/10 ring-1 ring-sage/20"}`}>
                {user.role === "ADMIN" ? (
                  <Shield className="h-5 w-5 text-terracotta" />
                ) : (
                  <UserCircle className="h-5 w-5 text-sage" />
                )}
              </div>
              <div>
                <p className="font-bold text-dark-brown">{user.name}</p>
                <p className="text-xs text-warm-gray">{user.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user.role === "ADMIN" ? "bg-terracotta/10 text-terracotta" : "bg-sage/10 text-sage"}`}>
                {user.role}
              </span>
            </div>
            {user.id !== currentUserId && (
              <button
                onClick={() => handleDelete(user.id, user.name)}
                disabled={deleting === user.id}
                className="p-2 text-warm-gray hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
              >
                {deleting === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}