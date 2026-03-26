import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  badRequest,
  conflict,
  notFound,
  serverError,
} from "@/lib/api-response";
import { deleteFromR2 } from "@/lib/r2";
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

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
    });
    if (!existing) return notFound("Product");

    if (existing._count.orderItems > 0 || existing._count.reviews > 0) {
      return conflict(
        "Produk tidak bisa dihapus karena sudah memiliki riwayat pesanan atau ulasan"
      );
    }

    await Promise.all(
      existing.images.map(async (image) => {
        try {
          await deleteFromR2(image.key);
        } catch (r2Error) {
          console.error("Failed to delete product image from R2:", r2Error);
        }
      })
    );

    await prisma.product.delete({
      where: { id },
    });

    return apiSuccess({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return serverError();
  }
}
