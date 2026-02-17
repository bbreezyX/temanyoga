import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createCouponSchema } from "@/lib/validations/coupon";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });

    return apiSuccess(coupons);
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return badRequest("Kode kupon sudah digunakan");
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        expiresAt: parsed.data.expiresAt,
      },
      include: { _count: { select: { orders: true } } },
    });

    return apiSuccess(coupon, 201);
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error);
    return serverError();
  }
}
