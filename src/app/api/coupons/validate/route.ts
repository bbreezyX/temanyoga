import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { validateCouponSchema } from "@/lib/validations/coupon";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.code.toUpperCase().trim() },
    });

    if (!coupon) {
      return badRequest("Kode kupon tidak ditemukan");
    }

    if (!coupon.isActive) {
      return badRequest("Kode kupon sudah tidak aktif");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return badRequest("Kode kupon sudah kedaluwarsa");
    }

    return apiSuccess({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return serverError();
  }
}
