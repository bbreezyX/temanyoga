"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, X, Loader2, ZoomIn } from "lucide-react";
import { PaymentProofStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProofImageDialog } from "./proof-image-dialog";
import { apiPatch } from "@/lib/api-client";
import { getImageUrl } from "@/lib/image-url";
import { formatDateTime, getProofStatusLabel, getProofStatusVariant } from "@/lib/format";
import type { AdminPaymentProof } from "@/types/api";

export function PaymentProofReview({
  proofs,
  onUpdated,
}: {
  proofs: AdminPaymentProof[];
  onUpdated: () => void;
}) {
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleReview(
    proofId: string,
    status: typeof PaymentProofStatus.APPROVED | typeof PaymentProofStatus.REJECTED
  ) {
    setLoadingId(proofId);
    const res = await apiPatch(`/api/admin/payment-proofs/${proofId}`, {
      status,
    });
    setLoadingId(null);

    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }

    toast.success(
      status === PaymentProofStatus.APPROVED
        ? "Bukti pembayaran disetujui"
        : "Bukti pembayaran ditolak"
    );
    onUpdated();
  }

  if (proofs.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bukti Pembayaran ({proofs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="flex gap-4 rounded-md border p-3"
            >
              <div
                className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded border"
                onClick={() => setViewImage(getImageUrl(proof.imageUrl))}
              >
                <Image
                  src={getImageUrl(proof.imageUrl)}
                  alt="Payment proof"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getProofStatusVariant(proof.status)}>
                    {getProofStatusLabel(proof.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(proof.createdAt)}
                  </span>
                </div>
                {proof.notes && (
                  <p className="text-sm text-muted-foreground">{proof.notes}</p>
                )}
                {proof.status === PaymentProofStatus.PENDING && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleReview(proof.id, PaymentProofStatus.APPROVED)
                      }
                      disabled={loadingId === proof.id}
                    >
                      {loadingId === proof.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleReview(proof.id, PaymentProofStatus.REJECTED)
                      }
                      disabled={loadingId === proof.id}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ProofImageDialog
        imageUrl={viewImage}
        open={!!viewImage}
        onClose={() => setViewImage(null)}
      />
    </>
  );
}
