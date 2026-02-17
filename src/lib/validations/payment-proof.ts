import { z } from "zod";
import { PaymentProofStatus } from "@prisma/client";

export const reviewPaymentProofSchema = z.object({
  status: z.enum([PaymentProofStatus.APPROVED, PaymentProofStatus.REJECTED]),
  notes: z.string().max(1000).optional(),
});

export const paymentProofMetadataSchema = z.object({
  orderId: z.string().min(1),
});

export type ReviewPaymentProofInput = z.infer<typeof reviewPaymentProofSchema>;
