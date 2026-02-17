import { z } from "zod";

export const verifyOrderSchema = z.object({
  orderCode: z.string().min(1, "Kode order wajib diisi"),
  email: z.string().email("Format email tidak valid"),
});

export const createReviewSchema = z.object({
  orderItemId: z.string().min(1, "Item order wajib dipilih"),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().max(1000, "Komentar maksimal 1000 karakter").optional(),
});

export type VerifyOrderInput = z.infer<typeof verifyOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;