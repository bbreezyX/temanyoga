import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    if (!notification) {
      return notFound("Notification");
    }

    return apiSuccess(notification);
  } catch (error) {
    console.error("PUT /api/admin/notifications/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.notification.delete({
      where: { id },
    });

    return apiSuccess({ message: "Notification deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/notifications/[id] error:", error);
    return serverError();
  }
}