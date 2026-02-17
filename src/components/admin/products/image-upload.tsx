"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUpload } from "@/lib/api-client";
import type { ProductImage } from "@/types/api";

export function ImageUpload({
  productId,
  onUploaded,
}: {
  productId: string;
  onUploaded: (image: ProductImage) => void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setLoading(true);
    const res = await apiUpload<ProductImage>(
      `/api/admin/products/${productId}/images`,
      file
    );
    setLoading(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Gambar berhasil diunggah");
    if (fileRef.current) fileRef.current.value = "";
    onUploaded(res.data);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium cursor-pointer"
      />
      <Button size="sm" onClick={handleUpload} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <Upload className="mr-1 h-3 w-3" />
        )}
        Upload
      </Button>
    </div>
  );
}
