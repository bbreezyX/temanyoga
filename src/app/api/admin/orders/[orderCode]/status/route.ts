import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma/client";
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
import { sendWhatsAppToCustomer, getSiteSetting } from "@/lib/whatsapp";
import { getStatusChangeMessage } from "@/lib/whatsapp-templates";
import { sendEmailToCustomer } from "@/lib/email";
import { getStatusChangeEmail } from "@/lib/email-templates";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const order = await prisma.order.findUnique({ where: { orderCode } });
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
      where: { orderCode },
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

    const siteUrl =
      (await getSiteSetting("site_url")) || "https://temaniyoga.com";
    const tracking =
      updated.trackingNumber && updated.courier
        ? {
            trackingNumber: updated.trackingNumber,
            courier: updated.courier,
          }
        : null;

    const waMessage = getStatusChangeMessage(
      updated.status,
      updated.orderCode,
      updated.customerName,
      siteUrl,
      tracking,
    );

    if (waMessage) {
      sendWhatsAppToCustomer(updated.customerPhone, waMessage).catch((err) =>
        console.error("WA to customer failed:", err),
      );
    }

    const emailData = getStatusChangeEmail(
      updated.status,
      updated.orderCode,
      updated.customerName,
      siteUrl,
      tracking,
    );

    if (emailData) {
      sendEmailToCustomer(
        updated.customerEmail,
        emailData.subject,
        emailData.html,
        emailData.text,
      ).catch((err) => console.error("Email to customer failed:", err));
    }

    return apiSuccess(updated);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[orderCode]/status error:", error);
    return serverError();
  }
}
