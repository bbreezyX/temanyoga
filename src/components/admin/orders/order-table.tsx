"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/order/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Eye } from "lucide-react";
import type { AdminOrderListItem } from "@/types/api";

export function OrderTable({ orders }: { orders: AdminOrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Tidak ada pesanan ditemukan.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Item</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">
                {order.orderCode}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell className="text-center">
                {order._count.items}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(order.createdAt)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
