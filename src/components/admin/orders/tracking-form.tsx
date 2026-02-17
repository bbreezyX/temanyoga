"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiPatch } from "@/lib/api-client";

export function TrackingForm({
  orderId,
  currentTracking,
  currentCourier,
  onUpdated,
}: {
  orderId: string;
  currentTracking: string | null;
  currentCourier: string | null;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [trackingNumber, setTrackingNumber] = useState(currentTracking ?? "");
  const [courier, setCourier] = useState(currentCourier ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim() || !courier.trim()) {
      toast.error("Mohon isi nomor resi dan kurir");
      return;
    }

    setLoading(true);
    const res = await apiPatch(`/api/admin/orders/${orderId}/tracking`, {
      trackingNumber: trackingNumber.trim(),
      courier: courier.trim(),
    });
    setLoading(false);

    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success("Informasi pengiriman diperbarui");
    onUpdated();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trackingNumber">No. Resi</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="courier">Kurir</Label>
              <Input
                id="courier"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="JNE, JNT, SiCepat..."
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
