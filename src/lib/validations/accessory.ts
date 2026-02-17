import { z } from "zod";

export const createAccessorySchema = z.object({
  name: z.string().min(1, "Nama aksesoris wajib diisi").max(200),
  description: z.string().max(500).optional().nullable(),
  price: z.number().int().min(0, "Harga harus >= 0"),
  groupName: z.string().max(100).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateAccessorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().int().min(0).optional(),
  groupName: z.string().max(100).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAccessoryInput = z.infer<typeof createAccessorySchema>;
export type UpdateAccessoryInput = z.infer<typeof updateAccessorySchema>;
