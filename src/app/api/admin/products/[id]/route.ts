import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-response";
import { updateProductSchema } from "@/lib/validations/product";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFound("Product");

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { images: { orderBy: { order: "asc" } } },
    });

    return apiSuccess(product);
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return notFound("Product");

    // Soft-delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ message: "Product deactivated" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return serverError();
  }
}
