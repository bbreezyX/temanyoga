import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, notFound, serverError } from "@/lib/api-response";
import { updateCouponSchema } from "@/lib/validations/coupon";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Coupon");
    }

    // Check code uniqueness if changing code
    if (parsed.data.code && parsed.data.code !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({
        where: { code: parsed.data.code },
      });
      if (duplicate) {
        return badRequest("Kode kupon sudah digunakan");
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { orders: true } } },
    });

    return apiSuccess(coupon);
  } catch (error) {
    console.error("PATCH /api/admin/coupons/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Coupon");
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ message: "Kupon dinonaktifkan" });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return serverError();
  }
}
