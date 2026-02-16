"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/image-url";

export function ProofImageDialog({
  imageUrl,
  open,
  onClose,
}: {
  imageUrl: string | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        {imageUrl && (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={getImageUrl(imageUrl)}
              alt="Bukti pembayaran"
              fill
              className="object-contain"
              sizes="640px"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
