import { prisma } from "@/lib/prisma";
import type { ProductModel } from "@/generated/prisma/models";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderCode } from "@/lib/order-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { items, ...customerData } = parsed.data;

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

    // Calculate total
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.price,
        productNameSnapshot: product.name,
      };
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
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    return apiSuccess(
      {
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
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
