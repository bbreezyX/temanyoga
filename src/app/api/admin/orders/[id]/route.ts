import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  notFound,
  serverError,
  badRequest,
} from "@/lib/api-response";
import { validateStatusTransition } from "@/lib/order-status";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { slug: true, isActive: true },
            },
          },
        },
        paymentProofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return notFound("Order");

    return apiSuccess(order);
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return badRequest("Invalid status");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) return notFound("Order");

    try {
      validateStatusTransition(
        order.status as OrderStatus,
        status as OrderStatus,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid transition";
      return badRequest(message);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return apiSuccess(updatedOrder);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return serverError();
  }
}
