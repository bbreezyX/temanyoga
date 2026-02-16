import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: Record<string, unknown> = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          order: {
            select: {
              orderCode: true,
              customerName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return apiSuccess({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return serverError();
  }
}

export async function PUT() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return apiSuccess({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("PUT /api/admin/notifications error:", error);
    return serverError();
  }
}