import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { verifyOrderSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { orderCode, email } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { orderCode: orderCode.toUpperCase().trim() },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, isActive: true } },
          },
        },
      },
    });

    if (!order) {
      return badRequest("Kode order tidak ditemukan");
    }

    if (order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
      return badRequest("Email tidak cocok dengan data order");
    }

    if (order.status !== "COMPLETED") {
      return badRequest("Order belum selesai. Hanya order yang sudah selesai yang dapat diulas.");
    }

    const existingReviews = await prisma.review.findMany({
      where: { orderId: order.id },
      select: { orderItemId: true },
    });
    const reviewedItemIds = new Set(existingReviews.map((r) => r.orderItemId));

    const items = order.items.map((item) => ({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      productSlug: item.product.slug,
      quantity: item.quantity,
      hasReview: reviewedItemIds.has(item.id),
    }));

    return apiSuccess({
      orderCode: order.orderCode,
      customerName: order.customerName,
      items,
    });
  } catch (error) {
    console.error("POST /api/reviews/verify error:", error);
    return serverError();
  }
}