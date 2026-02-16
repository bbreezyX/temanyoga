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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTrackingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFound("Order");

    const updated = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber: parsed.data.trackingNumber,
        courier: parsed.data.courier,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id]/tracking error:", error);
    return serverError();
  }
}
