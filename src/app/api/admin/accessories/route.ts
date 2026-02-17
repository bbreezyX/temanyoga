import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createAccessorySchema } from "@/lib/validations/accessory";

export async function GET() {
  try {
    const accessories = await prisma.accessory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return apiSuccess(accessories);
  } catch (error) {
    console.error("GET /api/admin/accessories error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAccessorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const accessory = await prisma.accessory.create({
      data: parsed.data,
    });

    return apiSuccess(accessory, 201);
  } catch (error) {
    console.error("POST /api/admin/accessories error:", error);
    return serverError();
  }
}
