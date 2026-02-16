import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Name is required").max(200),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().min(1, "Phone is required").max(30),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingZoneId: z.string().min(1, "Shipping zone is required"),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

export const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  courier: z.string().min(1, "Courier is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;
