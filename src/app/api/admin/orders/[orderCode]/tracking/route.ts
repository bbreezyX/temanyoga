import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-response";
import { updateTrackingSchema } from "@/lib/validations/order";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const body = await request.json();
    const parsed = updateTrackingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const order = await prisma.order.findUnique({ where: { orderCode } });
    if (!order) return notFound("Order");

    const updated = await prisma.order.update({
      where: { orderCode },
      data: {
        trackingNumber: parsed.data.trackingNumber,
        courier: parsed.data.courier,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[orderCode]/tracking error:", error);
    return serverError();
  }
}
