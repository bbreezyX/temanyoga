import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createShippingZoneSchema } from "@/lib/validations/shipping-zone";

export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(zones);
  } catch (error) {
    console.error("GET /api/admin/shipping-zones error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createShippingZoneSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const zone = await prisma.shippingZone.create({
      data: parsed.data,
    });

    return apiSuccess(zone, 201);
  } catch (error) {
    console.error("POST /api/admin/shipping-zones error:", error);
    return serverError();
  }
}
