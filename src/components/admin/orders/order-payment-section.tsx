"use client";

import { Receipt, CheckCircle, XCircle, Maximize2 } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/image-url";
import { PaymentProofStatus } from "@prisma/client";

type PaymentProof = {
  id: string;
  imageUrl: string;
  status: PaymentProofStatus;
};

type OrderPaymentSectionProps = {
  paymentProof: PaymentProof | null | undefined;
  onReviewProof: (proofId: string, status: PaymentProofStatus) => Promise<void>;
  onViewImage: (url: string) => void;
  actionLoading: boolean;
};

export function OrderPaymentSection({
  paymentProof,
  onReviewProof,
  onViewImage,
  actionLoading,
}: OrderPaymentSectionProps) {
  const statusLabel =
    paymentProof?.status === "APPROVED"
      ? "DISETUJUI"
      : paymentProof?.status === "REJECTED"
        ? "DITOLAK"
        : paymentProof?.status === "PENDING"
          ? "MENUNGGU"
          : "Tanpa Bukti";

  const statusClasses =
    paymentProof?.status === "APPROVED"
      ? "bg-sage/10 text-sage ring-sage/20"
      : paymentProof?.status === "REJECTED"
        ? "bg-red-50 text-red-600 ring-red-200"
        : "bg-amber-50 text-amber-600 ring-amber-600/20";

  return (
    <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown">
          Bukti Pembayaran
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold ring-1 ring-inset ${statusClasses}`}
        >
          {statusLabel}
        </span>
      </div>

      {paymentProof ? (
        <div className="group relative overflow-hidden rounded-[24px] sm:rounded-[30px] aspect-[3/4] bg-cream shadow-inner flex items-center justify-center bg-gray-100">
          <Image
            src={getImageUrl(paymentProof.imageUrl)}
            alt="Payment Proof"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0 bg-dark-brown/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10 cursor-zoom-in"
            onClick={() => onViewImage(getImageUrl(paymentProof.imageUrl))}
          >
            <Maximize2 className="text-3xl text-white" />
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] sm:rounded-[30px] aspect-[3/4] bg-cream/50 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-warm-sand/30">
          <Receipt className="text-4xl sm:text-5xl text-warm-sand mb-4" />
          <p className="text-xs font-bold text-warm-gray leading-relaxed">
            Belum ada bukti pembayaran yang diunggah.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {paymentProof && paymentProof.status === "PENDING" && (
          <>
            <button
              onClick={() =>
                onReviewProof(paymentProof.id, PaymentProofStatus.APPROVED)
              }
              disabled={actionLoading}
              className="w-full bg-terracotta text-white rounded-full py-3.5 sm:py-4 font-bold shadow-lg hover:shadow-terracotta/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <CheckCircle className="h-5 w-5" />
              Tandai sebagai Terverifikasi Lunas
            </button>
            <button
              onClick={() =>
                onReviewProof(paymentProof.id, PaymentProofStatus.REJECTED)
              }
              disabled={actionLoading}
              className="w-full bg-red-50 text-red-600 border border-red-100 rounded-full py-3.5 sm:py-4 font-bold shadow-sm hover:bg-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <XCircle className="h-5 w-5" />
              Tolak Bukti
            </button>
          </>
        )}
      </div>
    </section>
  );
}