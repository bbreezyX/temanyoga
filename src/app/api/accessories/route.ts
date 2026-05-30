import { getActiveAccessories } from "@/lib/accessory-queries";
import { apiSuccess, serverError } from "@/lib/api-response";

export const revalidate = 60;

const CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  try {
    const accessories = await getActiveAccessories();
    const response = apiSuccess(accessories);
    response.headers.set("Cache-Control", CACHE_CONTROL);
    return response;
  } catch (error) {
    console.error("GET /api/accessories error:", error);
    return serverError();
  }
}
