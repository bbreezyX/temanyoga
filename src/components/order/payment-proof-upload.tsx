"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiUpload } from "@/lib/api-client";
import type { PaymentProofResponse } from "@/types/api";

export function PaymentProofUpload({
  orderCode,
  onUploaded,
}: {
  orderCode: string;
  onUploaded: () => void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("File harus berupa JPEG, PNG, atau WebP");
      return;
    }

    setLoading(true);
    const res = await apiUpload<PaymentProofResponse>(
      `/api/orders/${orderCode}/payment-proof`,
      file
    );
    setLoading(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Bukti pembayaran berhasil diunggah!");
    if (fileRef.current) fileRef.current.value = "";
    onUploaded();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Bukti Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Format: JPEG, PNG, atau WebP. Maksimal 5MB.
        </p>
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {loading ? "Mengunggah..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}
