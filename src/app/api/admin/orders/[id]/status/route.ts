import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import {
  apiSuccess,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-response";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { validateStatusTransition } from "@/lib/order-status";
import { InvalidStatusTransitionError } from "@/lib/errors";
import { broadcastNotification } from "@/lib/notification-broadcast";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFound("Order");

    try {
      validateStatusTransition(order.status, parsed.data.status);
    } catch (error) {
      if (error instanceof InvalidStatusTransitionError) {
        return badRequest(error.message);
      }
      throw error;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.ORDER_STATUS_CHANGED,
        title: "Status Pesanan Diperbarui",
        message: `Status pesanan ${updated.orderCode} diubah menjadi ${parsed.data.status}`,
        orderId: updated.id,
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

    return apiSuccess(updated);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id]/status error:", error);
    return serverError();
  }
}
