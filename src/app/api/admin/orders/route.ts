import { NextRequest } from "next/server";
import { apiSuccess, serverError } from "@/lib/api-response";
import {
  getAdminOrderList,
  parseAdminOrderCatalogParams,
} from "@/lib/admin-orders";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = parseAdminOrderCatalogParams({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    });

    const data = await getAdminOrderList(params);

    return apiSuccess(data);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return serverError();
  }
}
