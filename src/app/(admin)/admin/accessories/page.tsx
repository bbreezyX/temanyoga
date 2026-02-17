"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Loader2, Puzzle } from "lucide-react";
import { AccessoryList } from "@/components/admin/accessories/accessory-list";
import { AccessoryForm } from "@/components/admin/accessories/accessory-form";
import { apiFetch } from "@/lib/api-client";
import type { AdminAccessory } from "@/types/api";

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<AdminAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editAccessory, setEditAccessory] = useState<AdminAccessory | null>(null);

  const fetchAccessories = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminAccessory[]>("/api/admin/accessories");
    if (res.success) {
      setAccessories(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  function handleEdit(accessory: AdminAccessory) {
    setEditAccessory(accessory);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditAccessory(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-dark-brown tracking-tight">
            Aksesoris
          </h1>
          <p className="mt-2 text-warm-gray font-medium">
            Kelola aksesoris tambahan untuk produk.
          </p>
        </div>
      </div>

      <section
        className="rounded-[24px] sm:rounded-[40px] bg-white p-4 sm:p-8 shadow-soft ring-1 ring-warm-sand/30 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-cream ring-1 ring-warm-sand/50 grid place-items-center shrink-0">
              <Puzzle className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-dark-brown">
                Daftar Aksesoris
              </h2>
              <p className="text-[10px] sm:text-[11px] text-warm-gray">
                {formOpen ? "Sedang mengisi data aksesoris..." : "Tambahkan aksesoris add-on untuk produk."}
              </p>
            </div>
          </div>
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 sm:py-2.5 text-white font-bold text-sm shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30 hover:scale-[1.03] transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Aksesoris</span>
            </button>
          )}
        </div>

        {formOpen && (
          <AccessoryForm
            accessory={editAccessory}
            onClose={handleClose}
            onSaved={fetchAccessories}
          />
        )}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            <span className="text-sm font-medium text-warm-gray">
              Memuat aksesoris...
            </span>
          </div>
        ) : (
          <AccessoryList
            accessories={accessories}
            onEdit={handleEdit}
            onRefresh={fetchAccessories}
          />
        )}
      </section>
    </div>
  );
}
