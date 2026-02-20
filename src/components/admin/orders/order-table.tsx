"use client";

import { memo } from "react";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/order/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { AdminOrderListItem } from "@/types/api";

type OrderTableProps = {
  orders: AdminOrderListItem[];
};

type OrderRowProps = {
  order: AdminOrderListItem;
};

const OrderTableRow = memo(function OrderTableRow({ order }: OrderRowProps) {
  return (
    <tr className="group transition-colors hover:bg-cream/50 cursor-pointer">
      <td className="py-5 pl-8">
        <span className="font-display font-bold text-dark-brown">
          #{order.orderCode}
        </span>
      </td>
      <td className="py-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-cream ring-1 ring-warm-sand flex items-center justify-center text-[10px] font-bold text-dark-brown uppercase">
            {order.customerName.substring(0, 2)}
          </div>
          <span className="text-sm font-semibold text-dark-brown">
            {order.customerName}
          </span>
        </div>
      </td>
      <td className="py-5 text-sm font-medium text-warm-gray">
        {formatDateTime(order.createdAt)}
      </td>
      <td className="py-5 text-sm font-bold text-dark-brown">
        {order._count.items}
      </td>
      <td className="py-5">
        <StatusBadge status={order.status} />
      </td>
      <td className="py-5 text-sm font-bold text-dark-brown">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="py-5 pr-8 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-terracotta text-white shadow-lg shadow-terracotta/20 hover:scale-110 hover:bg-terracotta/90 transition-all active:scale-95"
            asChild
          >
            <Link href={`/admin/orders/${order.id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
});

const OrderCard = memo(function OrderCard({ order }: OrderRowProps) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-warm-sand/30 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display font-bold text-dark-brown text-lg">
          #{order.orderCode}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-cream/30 rounded-xl">
        <div className="h-10 w-10 rounded-full bg-white ring-1 ring-warm-sand flex items-center justify-center text-xs font-bold text-dark-brown uppercase shrink-0">
          {order.customerName.substring(0, 2)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-dark-brown">
            {order.customerName}
          </span>
          <span className="text-xs text-warm-gray">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
            Item
          </span>
          <span className="text-sm font-bold text-dark-brown">
            {order._count.items} item
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
            Jumlah
          </span>
          <span className="text-sm font-bold text-dark-brown">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      <Button
        className="w-full bg-dark-brown text-white hover:bg-dark-brown/90 rounded-xl py-6 shadow-lg shadow-dark-brown/10"
        asChild
      >
        <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" />
          Lihat Detail
        </Link>
      </Button>
    </div>
  );
});

export const OrderTable = memo(function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="min-h-[400px]">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-cream/50 text-[12px] font-black uppercase tracking-[0.1em] text-warm-gray sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="py-5 pl-8">Kode Pesanan</th>
              <th className="py-5">Pelanggan</th>
              <th className="py-5 text-sm font-medium text-warm-gray">Tanggal</th>
              <th className="py-5 text-sm font-bold text-dark-brown">Item</th>
              <th className="py-5">Status</th>
              <th className="py-5 text-sm font-bold text-dark-brown">Jumlah</th>
              <th className="py-5 pr-8 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-sand/20">
            {orders.map((order) => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
});