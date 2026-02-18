import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "CUSTOMER"]).default("ADMIN"),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
