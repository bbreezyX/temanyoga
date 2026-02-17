import { prisma } from "@/lib/prisma";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";
import { deleteFromR2 } from "@/lib/r2";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) return notFound("Image");

    // Delete from R2
    try {
      await deleteFromR2(image.key);
    } catch (r2Error) {
      console.error("Failed to delete from R2:", r2Error);
    }

    // Delete from DB
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return apiSuccess({ message: "Image deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/products/images/[imageId] error:", error);
    return serverError();
  }
}
