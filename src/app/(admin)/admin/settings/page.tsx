"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Loader2, MapPin, MessageCircle, Mail } from "lucide-react";
import { ShippingZoneList } from "@/components/admin/settings/shipping-zone-list";
import { ShippingZoneForm } from "@/components/admin/settings/shipping-zone-form";
import { WhatsAppSettings } from "@/components/admin/settings/whatsapp-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";
import { apiFetch } from "@/lib/api-client";
import type { AdminShippingZone } from "@/types/api";

export default function AdminSettingsPage() {
  const [zones, setZones] = useState<AdminShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editZone, setEditZone] = useState<AdminShippingZone | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminShippingZone[]>(
      "/api/admin/shipping-zones"
    );
    if (res.success) {
      setZones(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchZones, 0);
    return () => clearTimeout(timeout);
  }, [fetchZones]);

  function handleEdit(zone: AdminShippingZone) {
    setEditZone(zone);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditZone(null);
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-dark-brown tracking-tight">
            Pengaturan
          </h1>
          <p className="mt-2 text-warm-gray font-medium">
            Kelola konfigurasi toko Anda.
          </p>
        </div>
      </div>

      {/* Shipping Zones Section */}
      <section
        className="rounded-[24px] sm:rounded-[40px] bg-white p-4 sm:p-8 shadow-soft ring-1 ring-warm-sand/30 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-cream ring-1 ring-warm-sand/50 grid place-items-center shrink-0">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-dark-brown">
                Zona Pengiriman
              </h2>
              <p className="text-[10px] sm:text-[11px] text-warm-gray">
                {formOpen ? "Sedang mengatur biaya pengiriman..." : "Atur ongkir berdasarkan area pengiriman."}
              </p>
            </div>
          </div>
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 sm:py-2.5 text-white font-bold text-sm shadow-lg shadow-terracotta/20 hover:shadow-xl hover:shadow-terracotta/30 hover:scale-[1.03] transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Zona</span>
            </button>
          )}
        </div>

        {formOpen && (
          <ShippingZoneForm
            zone={editZone}
            onClose={handleClose}
            onSaved={fetchZones}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            <span className="text-sm font-medium text-warm-gray">
              Memuat zona pengiriman...
            </span>
          </div>
        ) : (
          <ShippingZoneList
            zones={zones}
            onEdit={handleEdit}
            onRefresh={fetchZones}
          />
        )}
      </section>

      {/* WhatsApp Integration Section */}
      <section
        className="rounded-[24px] sm:rounded-[40px] bg-white p-4 sm:p-8 shadow-soft ring-1 ring-warm-sand/30 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-cream ring-1 ring-warm-sand/50 grid place-items-center shrink-0">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-dark-brown">
              Integrasi WhatsApp
            </h2>
            <p className="text-[10px] sm:text-[11px] text-warm-gray">
              Atur notifikasi otomatis via WhatsApp ke pelanggan dan admin.
            </p>
          </div>
        </div>

        <WhatsAppSettings />
      </section>

      {/* Email Integration Section */}
      <section
        className="rounded-[24px] sm:rounded-[40px] bg-white p-4 sm:p-8 shadow-soft ring-1 ring-warm-sand/30 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-cream ring-1 ring-warm-sand/50 grid place-items-center shrink-0">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-dark-brown">
              Integrasi Email
            </h2>
            <p className="text-[10px] sm:text-[11px] text-warm-gray">
              Atur notifikasi otomatis via email ke pelanggan.
            </p>
          </div>
        </div>

        <EmailSettings />
      </section>
    </div>
  );
}
