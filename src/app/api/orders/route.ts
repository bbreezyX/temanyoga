import { prisma } from "@/lib/prisma";
import type { ProductModel } from "@/generated/prisma/models";
import { NotificationType } from "@/generated/prisma/client";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderCode } from "@/lib/order-code";
import { broadcastNotification } from "@/lib/notification-broadcast";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { items, shippingZoneId, ...customerData } = parsed.data;

    // Validate shipping zone exists and is active
    const shippingZone = await prisma.shippingZone.findUnique({
      where: { id: shippingZoneId },
    });

    if (!shippingZone || !shippingZone.isActive) {
      return badRequest("Zona pengiriman tidak valid atau tidak aktif");
    }

    // Fetch all products in one query
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    // Validate all products exist
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.find((id) => !foundIds.has(id));
      return badRequest(`Product not found: ${missing}`);
    }

    // Validate stock
    const productMap = new Map<string, ProductModel>(
      products.map((p) => [p.id, p])
    );
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stock !== null && product.stock < item.quantity) {
        return badRequest(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`
        );
      }
    }

    // Calculate total = subtotal products + shipping cost
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.price,
        productNameSnapshot: product.name,
      };
    });

    const shippingCost = shippingZone.price;
    const totalAmount = subtotal + shippingCost;

    // Snapshot the zone info for historical reference
    const shippingZoneSnapshot = JSON.stringify({
      name: shippingZone.name,
      price: shippingZone.price,
    });

    // Create order in transaction with stock decrement
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock for products with finite stock
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        if (product.stock !== null) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });
          if (updated.count === 0) {
            throw new Error(
              `Insufficient stock for "${product.name}"`
            );
          }
        }
      }

      return tx.order.create({
        data: {
          orderCode: generateOrderCode(),
          ...customerData,
          totalAmount,
          shippingCost,
          shippingZoneId,
          shippingZoneSnapshot,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.NEW_ORDER,
        title: "Pesanan Baru",
        message: `Pesanan baru dari ${order.customerName} senilai Rp ${order.totalAmount.toLocaleString("id-ID")}`,
        orderId: order.id,
      },
      include: {
        order: {
          select: {
            orderCode: true,
            customerName: true,
          },
        },
      },
    });

    broadcastNotification(notification);

    return apiSuccess(
      {
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        status: order.status,
        items: order.items,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return badRequest(error.message);
    }
    return serverError();
  }
}
