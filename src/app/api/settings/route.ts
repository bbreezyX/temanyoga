import { getPublicBankSettings } from "@/lib/order-queries";
import { apiSuccess, serverError } from "@/lib/api-response";

export const revalidate = 300;

const CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=600";

export async function GET() {
  try {
    const settings = await getPublicBankSettings();
    const response = apiSuccess(settings);
    response.headers.set("Cache-Control", CACHE_CONTROL);
    return response;
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return serverError();
  }
}
