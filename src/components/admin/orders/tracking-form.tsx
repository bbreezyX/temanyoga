"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiPatch } from "@/lib/api-client";

const trackingFormSchema = z.object({
  trackingNumber: z.string().min(1, "Nomor resi wajib diisi").max(100, "Nomor resi maksimal 100 karakter"),
  courier: z.string().min(1, "Nama kurir wajib diisi").max(50, "Nama kurir maksimal 50 karakter"),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      trackingNumber: currentTracking ?? "",
      courier: currentCourier ?? "",
    },
  });

  const onSubmit = async (data: TrackingFormData) => {
    const res = await apiPatch(`/api/admin/orders/${orderId}/tracking`, {
      trackingNumber: data.trackingNumber.trim(),
      courier: data.courier.trim(),
    });

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Informasi pengiriman diperbarui");
    onUpdated();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trackingNumber">No. Resi</Label>
              <Input
                id="trackingNumber"
                {...register("trackingNumber")}
              />
              {errors.trackingNumber && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.trackingNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="courier">Kurir</Label>
              <Input
                id="courier"
                {...register("courier")}
                placeholder="JNE, JNT, SiCepat..."
              />
              {errors.courier && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.courier.message}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}