import { z } from "zod";

export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Nama zona wajib diisi").max(100),
  description: z.string().max(500).optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateShippingZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>;
export type UpdateShippingZoneInput = z.infer<typeof updateShippingZoneSchema>;
