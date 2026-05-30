"use client";

import { useState } from "react";
import { Truck, MapPin } from "lucide-react";

type OrderDeliverySectionProps = {
  customerName: string;
  shippingAddress: string;
  courier: string | null;
  trackingNumber: string | null;
  onUpdateTracking: (courier: string, trackingNumber: string) => Promise<void>;
  actionLoading: boolean;
};

export function OrderDeliverySection({
  customerName,
  shippingAddress,
  courier,
  trackingNumber,
  onUpdateTracking,
  actionLoading,
}: OrderDeliverySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCourier, setEditCourier] = useState(courier || "");
  const [editTrackingNumber, setEditTrackingNumber] = useState(
    trackingNumber || ""
  );

  const handleSave = async () => {
    await onUpdateTracking(editCourier, editTrackingNumber);
    setIsEditing(false);
  };

  return (
    <section
      id="delivery-section"
      className="rounded-[32px] sm:rounded-[40px] bg-paper p-6 sm:p-8 border border-black/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
          <Truck className="text-sage h-5 w-5 sm:h-6 sm:w-6" />
          Informasi Pengiriman
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-action hover:underline"
        >
          {isEditing ? "Batal Ubah" : "Ubah Detail"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-ink/60">
            Alamat Pengiriman
          </p>
          <div className="bg-cream/40 p-5 rounded-3xl ring-1 ring-warm-sand/30">
            <p className="font-bold text-ink">{customerName}</p>
            <p className="text-sm text-ink/60 leading-relaxed mt-1 whitespace-pre-wrap break-words">
              {shippingAddress}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-ink/60">
            Detail Logistik
          </p>
          {isEditing ? (
            <div className="space-y-3 bg-cream/20 p-4 rounded-3xl ring-1 ring-warm-sand/30">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Kurir
                </label>
                <input
                  value={editCourier}
                  onChange={(e) => setEditCourier(e.target.value)}
                  className="w-full rounded-full border border-black/10 bg-paper px-4 py-2 text-sm text-ink transition focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15"
                  placeholder="Contoh: JNE"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Nomor Resi
                </label>
                <input
                  value={editTrackingNumber}
                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                  className="w-full rounded-full border border-black/10 bg-paper px-4 py-2 text-sm text-ink transition focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15"
                  placeholder="Contoh: JBX123456789"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={actionLoading}
                className="w-full rounded-full bg-ink text-white py-2 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Simpan Detail
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-cream flex items-center justify-center text-ink/60">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">
                    {courier || "Belum diatur"}
                  </p>
                  <p className="text-[10px] text-ink/60">Layanan Kurir</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-cream flex items-center justify-center text-ink/60">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink truncate">
                    {trackingNumber || "Belum tersedia"}
                  </p>
                  <p className="text-[10px] text-ink/60 italic">
                    Nomor Resi
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}