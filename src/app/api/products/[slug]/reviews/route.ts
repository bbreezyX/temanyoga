import { getProductReviewsBySlug } from "@/lib/review-queries";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import type { NextRequest } from "next/server";

export const revalidate = 60;

const CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const data = await getProductReviewsBySlug(slug);

    if (!data) {
      return badRequest("Produk tidak ditemukan");
    }

    const response = apiSuccess(data);
    response.headers.set("Cache-Control", CACHE_CONTROL);
    return response;
  } catch (error) {
    console.error("GET /api/products/[slug]/reviews error:", error);
    return serverError();
  }
}
