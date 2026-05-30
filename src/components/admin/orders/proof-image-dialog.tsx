"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProofImageDialog({
  imageUrl,
  open,
  onClose,
}: {
  /** Already normalized via getImageUrl() by the caller. */
  imageUrl: string | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Bukti Pembayaran</DialogTitle>
        {imageUrl && (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={imageUrl}
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
