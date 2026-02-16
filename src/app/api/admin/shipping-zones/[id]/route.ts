import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, notFound, serverError } from "@/lib/api-response";
import { updateShippingZoneSchema } from "@/lib/validations/shipping-zone";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateShippingZoneSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Shipping zone");
    }

    const zone = await prisma.shippingZone.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(zone);
  } catch (error) {
    console.error("PATCH /api/admin/shipping-zones/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Shipping zone");
    }

    // Soft delete — just deactivate
    await prisma.shippingZone.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ message: "Shipping zone deactivated" });
  } catch (error) {
    console.error("DELETE /api/admin/shipping-zones/[id] error:", error);
    return serverError();
  }
}
