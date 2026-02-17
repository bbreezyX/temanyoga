import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";
import { NotificationType } from "@prisma/client";
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

    const { items, shippingZoneId, couponCode, ...customerData } = parsed.data;

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
    const productMap = new Map<string, Product>(
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

    // Collect all unique accessory IDs from all items
    const allAccessoryIds = new Set<string>();
    for (const item of items) {
      if (item.accessoryIds) {
        for (const id of item.accessoryIds) allAccessoryIds.add(id);
      }
    }

    // Fetch accessories if any were requested
    const accessoryMap = new Map<string, { id: string; name: string; price: number; groupName: string | null; isActive: boolean }>();
    if (allAccessoryIds.size > 0) {
      const accessories = await prisma.accessory.findMany({
        where: { id: { in: [...allAccessoryIds] } },
        select: { id: true, name: true, price: true, groupName: true, isActive: true },
      });
      for (const a of accessories) accessoryMap.set(a.id, a);

      // Validate all accessories exist and are active
      for (const accId of allAccessoryIds) {
        const acc = accessoryMap.get(accId);
        if (!acc) return badRequest(`Aksesoris tidak ditemukan: ${accId}`);
        if (!acc.isActive) return badRequest(`Aksesoris "${acc.name}" tidak aktif`);
      }
    }

    // Validate group constraints and build order items
    let subtotal = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      unitPriceSnapshot: number;
      productNameSnapshot: string;
      accessoriesSnapshot: string | null;
      accessoriesTotal: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const itemAccessories: { name: string; price: number }[] = [];
      let accTotal = 0;

      if (item.accessoryIds && item.accessoryIds.length > 0) {
        // Deduplicate accessory IDs for the same item
        const uniqueAccIds = Array.from(new Set(item.accessoryIds));
        const groupSeen = new Map<string, string>();

        for (const accId of uniqueAccIds) {
          const acc = accessoryMap.get(accId)!;
          if (acc.groupName) {
            if (groupSeen.has(acc.groupName)) {
              return badRequest(`Hanya bisa pilih 1 aksesoris dari grup "${acc.groupName}" untuk produk "${product.name}"`);
            }
            groupSeen.set(acc.groupName, acc.id);
          }
          itemAccessories.push({ name: acc.name, price: acc.price });
          accTotal += acc.price;
        }
      }

      const itemTotal = (product.price + accTotal) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.price,
        productNameSnapshot: product.name,
        accessoriesSnapshot: itemAccessories.length > 0 ? JSON.stringify(itemAccessories) : null,
        accessoriesTotal: accTotal,
      });
    }

    // Validate and calculate coupon discount
    let couponId: string | null = null;
    let validCouponCode: string | null = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (!coupon || !coupon.isActive) {
        return badRequest("Kode kupon tidak valid atau tidak aktif");
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return badRequest("Kode kupon sudah kedaluwarsa");
      }

      couponId = coupon.id;
      validCouponCode = coupon.code;

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = Math.floor(subtotal * coupon.discountValue / 100);
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }
    }

    const shippingCost = shippingZone.price;
    const totalAmount = subtotal - discountAmount + shippingCost;

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
          couponId,
          couponCode: validCouponCode,
          discountAmount,
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
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
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
