"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPatch } from "@/lib/api-client";
import { getStatusLabel } from "@/lib/format";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [OrderStatus.AWAITING_VERIFICATION, OrderStatus.CANCELLED],
  AWAITING_VERIFICATION: [
    OrderStatus.PAID,
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.CANCELLED,
  ],
  PAID: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export function StatusUpdate({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const allowed = TRANSITIONS[currentStatus] ?? [];

  if (allowed.length === 0) return null;

  async function handleUpdate() {
    if (!newStatus) return;
    setLoading(true);
    const res = await apiPatch(`/api/admin/orders/${orderId}/status`, {
      status: newStatus,
    });
    setLoading(false);
    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Status pesanan diperbarui");
    setNewStatus("");
    onUpdated();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Status</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="flex-1">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih status baru" />
            </SelectTrigger>
            <SelectContent>
              {allowed.map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleUpdate} disabled={!newStatus || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
