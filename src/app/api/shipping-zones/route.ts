import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, price: true },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(zones);
  } catch (error) {
    console.error("GET /api/shipping-zones error:", error);
    return serverError();
  }
}
