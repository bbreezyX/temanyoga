"use client";

import Link from "next/link";
import { User, Mail, Phone, MessageCircle } from "lucide-react";

type OrderCustomerSectionProps = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export function OrderCustomerSection({
  customerName,
  customerEmail,
  customerPhone,
}: OrderCustomerSectionProps) {
  return (
    <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
      <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown mb-6">
        Pelanggan
      </h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-terracotta/10 flex items-center justify-center ring-2 ring-terracotta/20 shrink-0">
          <User className="text-2xl text-terracotta" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-dark-brown leading-tight truncate">
            {customerName}
          </p>
          <p className="text-xs font-bold text-sage uppercase tracking-wider">
            Pelanggan
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="text-warm-gray h-4 w-4 shrink-0" />
          <span className="text-dark-brown font-medium truncate">
            {customerEmail}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="text-warm-gray h-4 w-4 shrink-0" />
          <span className="text-dark-brown font-medium">{customerPhone}</span>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-warm-sand/30">
        <Link
          href={`https://wa.me/${customerPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-cream text-dark-brown rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-warm-sand transition-colors"
        >
          <MessageCircle className="text-lg" />
          Chat Pelanggan
        </Link>
      </div>
    </section>
  );
}