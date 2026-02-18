import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Shield,
  UserCircle,
  Pencil,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch, apiPost, apiDelete, apiPatch } from "@/lib/api-client";
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
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New user form states
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "CUSTOMER">("ADMIN");

  // Edit user form states
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "CUSTOMER">("ADMIN");

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await apiFetch<AdminUser[]>("/api/admin/users");
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(true);
    }, 0);
    return () => clearTimeout(timer);
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

  function startEdit(user: AdminUser) {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditPassword("");
    setEditRole(user.role as "ADMIN" | "CUSTOMER");
    setShowForm(false);
  }

  async function handleUpdate() {
    if (!editingUser) return;
    if (!editEmail.trim() || !editName.trim()) {
      toast.error("Email dan nama wajib diisi");
      return;
    }

    setSaving(true);
    const res = await apiPatch<AdminUser>("/api/admin/users", {
      id: editingUser.id,
      email: editEmail.trim(),
      name: editName.trim(),
      password: editPassword || undefined,
      role: editRole,
    });
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memperbarui pengguna");
      return;
    }

    toast.success("Pengguna berhasil diperbarui");
    setEditingUser(null);
    fetchUsers();
    onRefresh();
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?`)) return;

    setDeleting(userId);
    const res = await apiDelete<{ deleted: boolean }>(
      `/api/admin/users?id=${userId}`,
    );
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
        <span className="text-sm font-medium text-warm-gray">
          Memuat pengguna...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-dark-brown">
          Daftar Pengguna
        </h3>
        {!showForm && !editingUser && (
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
          <h4 className="font-bold text-dark-brown font-display text-base">
            Tambah Pengguna Baru
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Nama
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama pengguna"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) =>
                  setNewRole(e.target.value as "ADMIN" | "CUSTOMER")
                }
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

      {editingUser && (
        <div className="bg-terracotta/5 rounded-2xl p-6 ring-1 ring-terracotta/20 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-dark-brown font-display text-base uppercase tracking-wider">
              Edit Pengguna:{" "}
              <span className="text-terracotta font-black">
                {editingUser.name}
              </span>
            </h4>
            <button
              onClick={() => setEditingUser(null)}
              className="p-1.5 hover:bg-terracotta/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-warm-gray" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Nama
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nama pengguna"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Email
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Password Baru (Opsional)
              </label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin diubah"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray px-1">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as "ADMIN" | "CUSTOMER")
                }
                disabled={editingUser.id === currentUserId}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-dark-brown ring-1 ring-warm-sand/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-50"
              >
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
              {editingUser.id === currentUserId && (
                <p className="text-[10px] text-warm-gray px-1 italic">
                  Tidak dapat mengubah role akun sendiri.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-6 py-2.5 font-bold text-sm text-white bg-terracotta rounded-full shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Perbarui
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="px-6 py-2.5 font-bold text-sm text-warm-gray bg-warm-sand/20 rounded-full hover:bg-warm-sand/30 transition-all font-display"
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
            className={`flex items-center justify-between p-4 rounded-2xl ring-1 transition-all ${editingUser?.id === user.id ? "bg-white ring-terracotta shadow-md scale-[1.01]" : "bg-cream/30 ring-warm-sand/20"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-11 w-11 rounded-full ${user.role === "ADMIN" ? "bg-terracotta/10 ring-1 ring-terracotta/20" : "bg-sage/10 ring-1 ring-sage/20"}`}
              >
                {user.role === "ADMIN" ? (
                  <Shield className="h-5 w-5 text-terracotta" />
                ) : (
                  <UserCircle className="h-5 w-5 text-sage" />
                )}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-dark-brown">{user.name}</p>
                <p className="text-xs text-warm-gray">{user.email}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${user.role === "ADMIN" ? "bg-terracotta/10 text-terracotta" : "bg-sage/10 text-sage"}`}
              >
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(user)}
                className={`p-2 rounded-full transition-all ${editingUser?.id === user.id ? "bg-terracotta text-white" : "text-warm-gray hover:text-dark-brown hover:bg-warm-sand/20"}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
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
          </div>
        ))}
      </div>
    </div>
  );
}
