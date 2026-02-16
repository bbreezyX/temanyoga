import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.number().int().positive("Price must be positive"),
  stock: z.number().int().min(0).nullable().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
