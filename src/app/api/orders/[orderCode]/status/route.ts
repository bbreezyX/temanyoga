import { getOrderStatusByCode } from "@/lib/order-queries";
import { apiSuccess, notFound, serverError } from "@/lib/api-response";

export const revalidate = 60;

const CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const order = await getOrderStatusByCode(orderCode);

    if (!order) return notFound("Order");

    const response = apiSuccess(order);
    response.headers.set("Cache-Control", CACHE_CONTROL);
    return response;
  } catch (error) {
    console.error("GET /api/orders/[orderCode]/status error:", error);
    return serverError();
  }
}
