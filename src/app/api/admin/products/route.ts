import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { createProductSchema } from "@/lib/validations/product";
import {
  getAdminProductList,
  parseAdminProductCatalogParams,
} from "@/lib/admin-products";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const params = parseAdminProductCatalogParams({
      page: searchParams.get("page") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      stock: searchParams.get("stock") ?? undefined,
      status:
        searchParams.get("status") ??
        (searchParams.get("isActive") === "true"
          ? "active"
          : searchParams.get("isActive") === "false"
            ? "inactive"
            : undefined),
    });

    const data = await getAdminProductList({ ...params, limit });

    return apiSuccess(data);
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
