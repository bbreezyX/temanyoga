import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { addClient, removeClient } from "@/lib/notification-broadcast";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller might be closed
        }
      };

      addClient({ id: clientId, send });

      const sendHeartbeat = () => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      };

      const heartbeatInterval = setInterval(sendHeartbeat, 30000);

      try {
        const [notifications, unreadCount] = await Promise.all([
          prisma.notification.findMany({
            include: {
              order: {
                select: {
                  orderCode: true,
                  customerName: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          prisma.notification.count({ where: { isRead: false } }),
        ]);

        send({ type: "init", data: { notifications, unreadCount } });
      } catch (error) {
        console.error("[SSE] Initial fetch error:", error);
        send({ type: "error", data: "Failed to fetch notifications" });
      }

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        removeClient(clientId);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}