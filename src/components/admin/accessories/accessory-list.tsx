"use client";

import { Pencil, Trash2, Puzzle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiDelete } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { AdminAccessory } from "@/types/api";

interface AccessoryListProps {
  accessories: AdminAccessory[];
  onEdit: (accessory: AdminAccessory) => void;
  onRefresh: () => void;
}

export function AccessoryList({ accessories, onEdit, onRefresh }: AccessoryListProps) {
  const toast = useToast();

  async function handleDeactivate(accessory: AdminAccessory) {
    if (!confirm(`Nonaktifkan aksesoris "${accessory.name}"?`)) return;

    const res = await apiDelete(`/api/admin/accessories/${accessory.id}`);
    if (res.success) {
      toast.success("Aksesoris dinonaktifkan");
      onRefresh();
    } else {
      toast.error("Gagal menonaktifkan aksesoris");
    }
  }

  if (accessories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="h-16 w-16 rounded-full bg-cream grid place-items-center">
          <Puzzle className="h-8 w-8 text-warm-gray/50" />
        </div>
        <p className="text-sm font-bold text-warm-gray">
          Belum ada aksesoris.
        </p>
        <p className="text-xs text-warm-gray/70">
          Buat aksesoris pertama dengan tombol di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {accessories.map((acc) => (
          <div
            key={acc.id}
            className="rounded-2xl bg-cream/30 p-5 ring-1 ring-warm-sand/20 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-dark-brown text-base">
                  {acc.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                      acc.isActive
                        ? "bg-sage/10 text-sage ring-sage/20"
                        : "bg-red-50 text-red-500 ring-red-200"
                    }`}
                  >
                    {acc.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  {acc.groupName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warm-gray/60">
                      {acc.groupName}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-terracotta text-lg">
                  {formatCurrency(acc.price)}
                </span>
              </div>
            </div>

            {acc.description && (
              <p className="text-xs text-warm-gray leading-relaxed">
                {acc.description}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => onEdit(acc)}
                className="flex items-center gap-2 rounded-full bg-warm-sand/50 px-4 py-2 text-dark-brown font-bold text-xs transition-all active:scale-95"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              {acc.isActive && (
                <button
                  onClick={() => handleDeactivate(acc)}
                  className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-red-500 font-bold text-xs transition-all active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Nonaktifkan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60 border-b border-warm-sand/30">
            <tr>
              <th className="text-left pb-4 pl-2">Nama</th>
              <th className="text-center pb-4">Grup</th>
              <th className="text-right pb-4">Harga</th>
              <th className="text-center pb-4">Urutan</th>
              <th className="text-center pb-4">Status</th>
              <th className="text-right pb-4 pr-2">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-sand/20">
            {accessories.map((acc) => (
              <tr
                key={acc.id}
                className="group hover:bg-cream/30 transition-colors"
              >
                <td className="py-4 pl-2">
                  <div>
                    <span className="font-bold text-dark-brown text-sm">
                      {acc.name}
                    </span>
                    {acc.description && (
                      <p className="text-[11px] text-warm-gray mt-0.5 line-clamp-1">
                        {acc.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="text-xs font-medium text-warm-gray">
                    {acc.groupName || "—"}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <span className="font-bold text-terracotta text-sm">
                    {formatCurrency(acc.price)}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm font-medium text-warm-gray">
                    {acc.sortOrder}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                      acc.isActive
                        ? "bg-sage/10 text-sage ring-sage/20"
                        : "bg-red-50 text-red-500 ring-red-200"
                    }`}
                  >
                    {acc.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="py-4 pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(acc)}
                      className="h-9 w-9 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-warm-sand hover:text-dark-brown transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {acc.isActive && (
                      <button
                        onClick={() => handleDeactivate(acc)}
                        className="h-9 w-9 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
