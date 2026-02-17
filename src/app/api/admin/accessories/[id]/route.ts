import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, notFound, serverError } from "@/lib/api-response";
import { updateAccessorySchema } from "@/lib/validations/accessory";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAccessorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const existing = await prisma.accessory.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Accessory");
    }

    const accessory = await prisma.accessory.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(accessory);
  } catch (error) {
    console.error("PATCH /api/admin/accessories/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.accessory.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Accessory");
    }

    await prisma.accessory.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ message: "Aksesoris dinonaktifkan" });
  } catch (error) {
    console.error("DELETE /api/admin/accessories/[id] error:", error);
    return serverError();
  }
}
