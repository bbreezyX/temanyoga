"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, MessageSquare, Send, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import {
  orderCreatedCustomer,
  paymentApprovedCustomer,
  paymentRejectedCustomer,
  orderShippedCustomer,
  orderCompletedCustomer,
  orderCancelledCustomer,
  orderCreatedAdmin,
  paymentProofUploadedAdmin,
} from "@/lib/whatsapp-templates";

const TEMPLATES = [
  { id: "order_created", name: "Pesanan Dibuat (Customer)", type: "customer" },
  { id: "payment_approved", name: "Pembayaran Disetujui", type: "customer" },
  { id: "payment_rejected", name: "Pembayaran Ditolak", type: "customer" },
  { id: "order_shipped", name: "Pesanan Dikirim", type: "customer" },
  { id: "order_completed", name: "Pesanan Selesai", type: "customer" },
  { id: "order_cancelled", name: "Pesanan Dibatalkan", type: "customer" },
  { id: "admin_new_order", name: "Pesanan Baru (Admin)", type: "admin" },
  { id: "admin_payment", name: "Bukti Bayar (Admin)", type: "admin" },
];

export default function WhatsAppPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<Record<string, string>>("/api/admin/settings").then((res) => {
      if (res.success) setSettings(res.data);
    });
  }, []);

  const mockOrder = {
    orderCode: "TY-123456",
    customerName: "Budi Santoso",
    customerPhone: "081234567890",
    totalAmount: 155000,
    shippingCost: 15000,
    discountAmount: 10000,
  };

  const siteUrl = settings.site_url || "https://temanyoga.com";
  const mockBank = {
    bankName: settings.bank_name || "BCA",
    accountNumber: settings.bank_account_number || "1234567890",
    accountName: settings.bank_account_name || "D'TEMAN YOGA Studio",
  };

  const mockTracking = {
    courier: "J&T Express",
    trackingNumber: "JT1234567890",
  };

  let message = "";
  switch (selectedTemplate) {
    case "order_created":
      message = orderCreatedCustomer(mockOrder, siteUrl, mockBank);
      break;
    case "payment_approved":
      message = paymentApprovedCustomer(mockOrder.orderCode, mockOrder.customerName, siteUrl);
      break;
    case "payment_rejected":
      message = paymentRejectedCustomer(mockOrder.orderCode, mockOrder.customerName, siteUrl, "Bukti transfer tidak valid atau nominal tidak sesuai.");
      break;
    case "order_shipped":
      message = orderShippedCustomer(mockOrder.orderCode, mockOrder.customerName, mockTracking, siteUrl);
      break;
    case "order_completed":
      message = orderCompletedCustomer(mockOrder.orderCode, mockOrder.customerName);
      break;
    case "order_cancelled":
      message = orderCancelledCustomer(mockOrder.orderCode, mockOrder.customerName);
      break;
    case "admin_new_order":
      message = orderCreatedAdmin(mockOrder);
      break;
    case "admin_payment":
      message = paymentProofUploadedAdmin(mockOrder.orderCode, mockOrder.customerName);
      break;
  }

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
              Preview Template WhatsApp
            </h1>
            <p className="text-warm-gray font-medium">
              Lihat format pesan otomatis yang dikirim melalui WhatsApp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Template Selection */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-[10px] font-bold text-warm-gray uppercase tracking-wider mb-4 px-2">
              Customer Messages
            </p>
            {TEMPLATES.filter(t => t.type === "customer").map((t) => (
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
                <MessageSquare className={cn("h-4 w-4 shrink-0", selectedTemplate === t.id ? "text-white" : "text-terracotta")} />
                <span>{t.name}</span>
              </button>
            ))}

            <p className="text-[10px] font-bold text-warm-gray uppercase tracking-wider mt-6 mb-4 px-2">
              Admin Notifications
            </p>
            {TEMPLATES.filter(t => t.type === "admin").map((t) => (
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
                <Bell className={cn("h-4 w-4 shrink-0", selectedTemplate === t.id ? "text-white" : "text-terracotta")} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Main - Preview */}
          <div className="lg:col-span-3">
            <div className="relative mx-auto w-full max-w-[400px]">
              {/* Phone Frame */}
              <div className="rounded-[48px] bg-[#0b141a] p-4 shadow-2xl ring-8 ring-[#202c33]">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-2 mb-2 text-[#8696a0] text-[10px] font-medium">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#8696a0]" />
                    <div className="h-2.5 w-4 bg-[#8696a0] rounded-sm" />
                  </div>
                </div>

                {/* Chat Header */}
                <div className="bg-[#202c33] -mx-4 -mt-2 p-4 mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#6b5b4b] grid place-items-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">Temanyoga</p>
                    <p className="text-[#8696a0] text-[10px] mt-1">Online</p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat min-h-[500px] -mx-4 p-4 flex flex-col justify-end">
                  <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-lg rounded-tl-none text-sm max-w-[85%] shadow-sm relative self-start">
                    <pre className="whitespace-pre-wrap font-sans">
                      {message}
                    </pre>
                    <p className="text-right text-[9px] text-[#8696a0] mt-1">9:41 AM</p>
                    {/* Bubble Tail */}
                    <div className="absolute top-0 -left-2 w-0 h-0 border-[10px] border-transparent border-t-[#005c4b]" />
                  </div>
                </div>

                {/* Chat Input */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-[#2a3942] rounded-full h-10 px-4 flex items-center text-[#8696a0] text-sm">
                    Type a message
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#00a884] grid place-items-center">
                    <Send className="h-5 w-5 text-[#111b21]" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-center text-xs text-warm-gray font-medium italic">
              * Tampilan di atas adalah simulasi interface WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
