import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { OrderStatusResponse } from "@/types/api";

export type PublicBankSettings = {
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
};

const orderStatusSelect = {
  orderCode: true,
  status: true,
  totalAmount: true,
  shippingCost: true,
  discountAmount: true,
  couponCode: true,
  customerName: true,
  shippingAddress: true,
  trackingNumber: true,
  courier: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getOrderStatusByCode = cache(
  async (orderCode: string): Promise<OrderStatusResponse | null> => {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: orderStatusSelect,
    });
    if (!order) return null;

    return {
      orderCode: order.orderCode,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      discountAmount: Number(order.discountAmount),
      couponCode: order.couponCode,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  },
);

export const getPublicBankSettings = cache(
  async (): Promise<PublicBankSettings> => {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["bank_name", "bank_account_number", "bank_account_name"],
        },
      },
    });

    const map: Record<string, string> = {};
    for (const setting of settings) {
      map[setting.key] = setting.value;
    }

    return {
      bank_name: map.bank_name || "BCA",
      bank_account_number: map.bank_account_number || "1234567890",
      bank_account_name: map.bank_account_name || "D'TEMAN YOGA Studio",
    };
  },
);
