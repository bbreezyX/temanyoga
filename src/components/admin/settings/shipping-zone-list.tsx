"use client";

import { Pencil, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiDelete } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { AdminShippingZone } from "@/types/api";

interface ShippingZoneListProps {
  zones: AdminShippingZone[];
  onEdit: (zone: AdminShippingZone) => void;
  onRefresh: () => void;
}

export function ShippingZoneList({
  zones,
  onEdit,
  onRefresh,
}: ShippingZoneListProps) {
  const toast = useToast();
  async function handleDeactivate(zone: AdminShippingZone) {
    if (!confirm(`Nonaktifkan zona "${zone.name}"?`)) return;

    const res = await apiDelete(`/api/admin/shipping-zones/${zone.id}`);
    if (res.success) {
      toast.success("Zona dinonaktifkan");
      onRefresh();
    } else {
      toast.error("Gagal menonaktifkan zona");
    }
  }

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="h-16 w-16 rounded-full bg-cream grid place-items-center">
          <MapPin className="h-8 w-8 text-warm-gray/50" />
        </div>
        <p className="text-sm font-bold text-warm-gray">
          Belum ada zona pengiriman.
        </p>
        <p className="text-xs text-warm-gray/70">
          Buat zona pertama dengan tombol di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60 border-b border-warm-sand/30">
          <tr>
            <th className="text-left pb-4 pl-2">Zona</th>
            <th className="text-right pb-4">Harga</th>
            <th className="text-center pb-4">Urutan</th>
            <th className="text-center pb-4">Status</th>
            <th className="text-right pb-4 pr-2">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-sand/20">
          {zones.map((zone) => (
            <tr key={zone.id} className="group hover:bg-cream/30 transition-colors">
              <td className="py-4 pl-2">
                <div>
                  <p className="font-bold text-dark-brown text-sm">
                    {zone.name}
                  </p>
                  {zone.description && (
                    <p className="text-xs text-warm-gray mt-0.5">
                      {zone.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="py-4 text-right">
                <span className="font-bold text-terracotta text-sm">
                  {zone.price === 0 ? "Gratis" : formatCurrency(zone.price)}
                </span>
              </td>
              <td className="py-4 text-center">
                <span className="text-sm font-medium text-warm-gray">
                  {zone.sortOrder}
                </span>
              </td>
              <td className="py-4 text-center">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                    zone.isActive
                      ? "bg-sage/10 text-sage ring-sage/20"
                      : "bg-red-50 text-red-500 ring-red-200"
                  }`}
                >
                  {zone.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="py-4 pr-2">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(zone)}
                    className="h-9 w-9 rounded-full bg-cream grid place-items-center text-warm-gray hover:bg-warm-sand hover:text-dark-brown transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {zone.isActive && (
                    <button
                      onClick={() => handleDeactivate(zone)}
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
  );
}
