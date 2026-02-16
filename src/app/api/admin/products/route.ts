import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createProductSchema } from "@/lib/validations/product";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    let slug = slugify(parsed.data.name, { lower: true, strict: true });

    // Ensure slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${nanoid(4)}`;
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
      },
      include: { images: true },
    });

    return apiSuccess(product, 201);
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return serverError();
  }
}
