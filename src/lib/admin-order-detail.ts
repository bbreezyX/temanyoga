import { prisma } from "@/lib/prisma";
import type { AdminOrderDetail } from "@/types/api";

export async function getAdminOrderDetail(
  orderCode: string,
): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              isActive: true,
              images: {
                take: 1,
                orderBy: { order: "asc" },
                select: { url: true },
              },
            },
          },
        },
      },
      paymentProofs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    orderCode: order.orderCode,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingCost: order.shippingCost,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    shippingZoneSnapshot: order.shippingZoneSnapshot,
    notes: order.notes,
    trackingNumber: order.trackingNumber,
    courier: order.courier,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceSnapshot: item.unitPriceSnapshot,
      productNameSnapshot: item.productNameSnapshot,
      accessoriesSnapshot: item.accessoriesSnapshot,
      accessoriesTotal: item.accessoriesTotal,
      product: item.product,
    })),
    paymentProofs: order.paymentProofs.map((proof) => ({
      id: proof.id,
      orderId: proof.orderId,
      imageUrl: proof.imageUrl,
      imageKey: proof.imageKey,
      status: proof.status,
      notes: proof.notes,
      reviewedAt: proof.reviewedAt?.toISOString() ?? null,
      createdAt: proof.createdAt.toISOString(),
    })),
  };
}
