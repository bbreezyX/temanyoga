import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";

/**
 * Custom Zod transform for sanitizing text input
 * Applies validation before transform
 */
const sanitizedText = (maxLength?: number, minLength = 0, message = "Required") =>
  z.string()
    .min(minLength, message)
    .max(maxLength || 10000)
    .transform((val) => val.trim());

/**
 * Custom Zod transform for sanitizing email
 */
const sanitizedEmail = z
  .string()
  .email("Invalid email")
  .transform((val) => val.toLowerCase().trim());

/**
 * Custom Zod transform for sanitizing phone numbers
 */
const sanitizedPhone = z
  .string()
  .min(1, "Phone is required")
  .max(30)
  .transform((val) => val.replace(/[^\d\s\-\(\)\+]/g, "").trim());

export const accessorySelectionSchema = z.object({
  accessoryId: z.string().min(1),
  selectedColor: z.string().trim().min(1).max(50).optional().nullable(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  accessorySelections: z.array(accessorySelectionSchema).optional(),
  accessoryIds: z.array(z.string()).optional(),
});

export const createOrderSchema = z.object({
  customerName: sanitizedText(200, 1, "Name is required"),
  customerEmail: sanitizedEmail,
  customerPhone: sanitizedPhone,
  shippingAddress: sanitizedText(2000, 1, "Address is required"),
  shippingZoneId: z.string().min(1).optional(),
  destinationVillageCode: z.string().max(20).optional(),
  selectedCourierCode: z.string().max(50).optional(),
  selectedCourierName: z.string().max(100).optional(),
  notes: z.string().max(1000).transform((val) => val.trim()).optional(),
  couponCode: z
    .string()
    .max(30)
    .transform((val) => (val ? val.toUpperCase().trim() : undefined))
    .optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
}).refine(
  (data) => data.shippingZoneId || (data.destinationVillageCode && data.selectedCourierCode),
  { message: "Wajib pilih kurir atau zona pengiriman" },
);

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

export const updateTrackingSchema = z.object({
  trackingNumber: sanitizedText(100, 1, "Tracking number is required"),
  courier: sanitizedText(50, 1, "Courier is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;
