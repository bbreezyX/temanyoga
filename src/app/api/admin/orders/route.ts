import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 20),
    );
    const skip = (page - 1) * limit;

    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && Object.values(OrderStatus).includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderCode: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom)
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo)
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [orders, total, totalOrders, pendingPayment, processing, completed] =
      await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            _count: { select: { items: true, paymentProofs: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
        prisma.order.count(), // Total all-time
        prisma.order.count({
          where: { status: OrderStatus.PENDING_PAYMENT },
        }),
        prisma.order.count({
          where: { status: OrderStatus.PROCESSING },
        }),
        prisma.order.count({
          where: { status: OrderStatus.COMPLETED },
        }),
      ]);

    return apiSuccess({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      orderStats: {
        totalOrders,
        pendingPayment,
        processing,
        completed,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return serverError();
  }
}
