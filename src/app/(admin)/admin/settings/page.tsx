"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Loader2, MapPin, MessageCircle, Mail, CreditCard } from "lucide-react";
import { ShippingZoneList } from "@/components/admin/settings/shipping-zone-list";
import { ShippingZoneForm } from "@/components/admin/settings/shipping-zone-form";
import { PaymentSettings } from "@/components/admin/settings/payment-settings";
import { WhatsAppSettings } from "@/components/admin/settings/whatsapp-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AdminShippingZone } from "@/types/api";

const TABS = [
  { id: "shipping", label: "Pengiriman", icon: MapPin },
  { id: "payment", label: "Pembayaran", icon: CreditCard },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("shipping");
  const [zones, setZones] = useState<AdminShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editZone, setEditZone] = useState<AdminShippingZone | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<AdminShippingZone[]>("/api/admin/shipping-zones");
      if (res.success) {
        setZones(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "shipping") {
      const load = async () => {
        const res = await apiFetch<AdminShippingZone[]>("/api/admin/shipping-zones");
        if (isMounted && res.success) {
          setZones(res.data);
          setLoading(false);
        }
      };
      load();
    }
    return () => { isMounted = false; };
  }, [activeTab]);

  function handleEdit(zone: AdminShippingZone) {
    setEditZone(zone);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditZone(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h1 className="font-display text-3xl font-extrabold text-dark-brown tracking-tight">
          Pengaturan
        </h1>
        <p className="text-warm-gray font-medium text-sm">
          Kelola konfigurasi toko Anda di satu tempat.
        </p>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-[#fdfaf8]/80 backdrop-blur-md border-b border-warm-sand/20 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none">
        <div className="flex items-center gap-1 p-1 bg-cream/50 ring-1 ring-warm-sand/30 rounded-2xl overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFormOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0",
                activeTab === tab.id
                  ? "bg-white text-terracotta shadow-sm ring-1 ring-warm-sand/20"
                  : "text-warm-gray hover:text-dark-brown hover:bg-white/50"
              )}
            >
              <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-terracotta" : "text-warm-gray")} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="relative min-h-[500px]">
        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-dark-brown">
                    Zona Pengiriman
                  </h2>
                  <p className="text-xs text-warm-gray mt-1">
                    Atur ongkir berdasarkan area pengiriman pelanggan.
                  </p>
                </div>
                {!formOpen && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-white font-bold text-sm shadow-lg shadow-terracotta/10 hover:shadow-terracotta/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Tambah Zona</span>
                  </button>
                )}
              </div>

              {formOpen ? (
                <div className="bg-cream/30 rounded-2xl p-6 ring-1 ring-warm-sand/20 mb-8 animate-fade-in">
                  <ShippingZoneForm
                    zone={editZone}
                    onClose={handleClose}
                    onSaved={fetchZones}
                  />
                </div>
              ) : null}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                  <span className="text-sm font-medium text-warm-gray">Memuat data...</span>
                </div>
              ) : (
                <ShippingZoneList
                  zones={zones}
                  onEdit={handleEdit}
                  onRefresh={fetchZones}
                />
              )}
            </section>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="mb-8">
                <h2 className="font-display text-xl font-extrabold text-dark-brown">
                  Informasi Pembayaran
                </h2>
                <p className="text-xs text-warm-gray mt-1">
                  Atur nomor rekening yang akan ditampilkan ke pelanggan saat checkout.
                </p>
              </div>
              <PaymentSettings />
            </section>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === "whatsapp" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="mb-8">
                <h2 className="font-display text-xl font-extrabold text-dark-brown">
                  Integrasi WhatsApp
                </h2>
                <p className="text-xs text-warm-gray mt-1">
                  Kelola notifikasi otomatis ke pelanggan dan admin via Fonnte.
                </p>
              </div>
              <WhatsAppSettings />
            </section>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "email" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="mb-8">
                <h2 className="font-display text-xl font-extrabold text-dark-brown">
                  Integrasi Email
                </h2>
                <p className="text-xs text-warm-gray mt-1">
                  Atur pengiriman notifikasi transaksi via email (Resend).
                </p>
              </div>
              <EmailSettings />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
