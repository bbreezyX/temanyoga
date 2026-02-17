import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const accessories = await prisma.accessory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        groupName: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    return apiSuccess(accessories);
  } catch (error) {
    console.error("GET /api/accessories error:", error);
    return serverError();
  }
}
