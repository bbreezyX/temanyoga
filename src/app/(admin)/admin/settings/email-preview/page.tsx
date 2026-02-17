"use client";

import { useState } from "react";
import { ChevronLeft, Eye, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "order_created", name: "Pesanan Dibuat", icon: Mail },
  { id: "payment_received", name: "Bukti Pembayaran Diterima", icon: MessageSquare },
  { id: "payment_approved", name: "Pembayaran Disetujui", icon: Eye },
  { id: "payment_rejected", name: "Pembayaran Ditolak", icon: Eye },
  { id: "order_shipped", name: "Pesanan Dikirim", icon: Mail },
  { id: "order_completed", name: "Pesanan Selesai", icon: Mail },
  { id: "order_cancelled", name: "Pesanan Dibatalkan", icon: Mail },
];

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);

  return (
    <div className="min-h-screen bg-cream/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 text-sm font-bold text-terracotta hover:gap-3 transition-all mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Pengaturan
            </Link>
            <h1 className="font-display text-3xl font-extrabold text-dark-brown tracking-tight">
              Preview Template Email
            </h1>
            <p className="text-warm-gray font-medium">
              Lihat bagaimana email notifikasi akan terlihat di sisi pelanggan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Template Selection */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-[10px] font-bold text-warm-gray uppercase tracking-wider mb-4 px-2">
              Pilih Template
            </p>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ring-1 ring-inset",
                  selectedTemplate === t.id
                    ? "bg-terracotta text-white ring-terracotta shadow-lg shadow-terracotta/20"
                    : "bg-white text-dark-brown ring-warm-sand/30 hover:bg-cream hover:ring-warm-sand/50"
                )}
              >
                <t.icon className={cn("h-4 w-4 shrink-0", selectedTemplate === t.id ? "text-white" : "text-terracotta")} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Main - Preview */}
          <div className="lg:col-span-3">
            <div className="rounded-[32px] bg-white shadow-soft ring-1 ring-warm-sand/30 overflow-hidden flex flex-col h-[800px]">
              {/* Preview Toolbar */}
              <div className="px-6 py-4 border-bottom border-warm-sand/20 bg-cream/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <p className="text-[10px] font-mono text-warm-gray font-bold">
                  email-preview.html
                </p>
                <div className="w-12" />
              </div>

              {/* Iframe for HTML Preview */}
              <iframe
                key={selectedTemplate}
                src={`/api/admin/email-preview?template=${selectedTemplate}`}
                className="flex-1 w-full border-none"
                title="Email Preview"
              />
            </div>
            
            <p className="mt-4 text-center text-xs text-warm-gray font-medium italic">
              * Tampilan di atas menggunakan data simulasi (mock data).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
