import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, notFound, serverError } from "@/lib/api-response";
import { uploadToR2 } from "@/lib/r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return notFound("Product");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("File is required");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Only JPEG, PNG, and WebP images are allowed");
    }
    if (file.size > MAX_FILE_SIZE) {
      return badRequest("File size must be less than 5MB");
    }

    // Determine next sort order
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastImage?.order ?? -1) + 1;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadToR2(buffer, "products", file.type);

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        key,
        order: nextOrder,
      },
    });

    return apiSuccess(image, 201);
  } catch (error) {
    console.error("POST /api/admin/products/[id]/images error:", error);
    return serverError();
  }
}
