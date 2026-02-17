import { z } from "zod";
import { DiscountType } from "@prisma/client";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Kode kupon wajib diisi")
    .max(30)
    .transform((v) => v.toUpperCase().trim()),
  discountType: z.enum(DiscountType),
  discountValue: z.number().int().positive("Nilai diskon harus lebih dari 0"),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
});

export const updateCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(30)
    .transform((v) => v.toUpperCase().trim())
    .optional(),
  discountType: z.enum(DiscountType).optional(),
  discountValue: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((v) => (v === undefined ? undefined : v ? new Date(v) : null)),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Kode kupon wajib diisi").max(30),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
