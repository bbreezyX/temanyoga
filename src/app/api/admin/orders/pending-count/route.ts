import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { apiSuccess, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pendingPayments = await prisma.order.count({
      where: { status: OrderStatus.PENDING_PAYMENT },
    });

    return apiSuccess({ pendingPayments });
  } catch (error) {
    console.error("GET /api/admin/orders/pending-count error:", error);
    return serverError();
  }
}
