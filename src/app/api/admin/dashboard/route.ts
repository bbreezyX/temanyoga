import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingPayments,
      revenueAggr,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { status: "PENDING_PAYMENT" as any },
      }),
      prisma.order.aggregate({
        where: {
          status: {
            in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] as any[],
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { items: true, paymentProofs: true } },
        },
      }),
    ]);

    return apiSuccess({
      todayOrders,
      pendingPayments,
      totalRevenue: revenueAggr._sum.totalAmount || 0,
      totalProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return serverError();
  }
}
