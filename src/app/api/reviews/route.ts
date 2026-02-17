import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createReviewSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { orderItemId, rating, comment } = parsed.data;

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return badRequest("Item order tidak ditemukan");
    }

    if (orderItem.order.status !== "COMPLETED") {
      return badRequest("Order belum selesai. Hanya order yang sudah selesai yang dapat diulas.");
    }

    const existingReview = await prisma.review.findUnique({
      where: { orderItemId },
    });

    if (existingReview) {
      return badRequest("Item ini sudah diulas");
    }

    const review = await prisma.review.create({
      data: {
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        orderItemId,
        customerName: orderItem.order.customerName,
        customerEmail: orderItem.order.customerEmail,
        rating,
        comment: comment || null,
      },
    });

    return apiSuccess({ id: review.id }, 201);
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return serverError();
  }
}