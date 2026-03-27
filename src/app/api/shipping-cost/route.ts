import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError, rateLimited } from "@/lib/api-response";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import {
  filterAllowedShippingCouriers,
  NO_ALLOWED_COURIER_MESSAGE,
  SHIPPING_API_UNAVAILABLE_MESSAGE,
} from "@/lib/shipping-couriers";

interface ExternalCourier {
  courier_code: string;
  courier_name: string;
  price: number;
  weight: number;
  estimation: string | null;
}

interface ExternalApiResponse {
  is_success: boolean;
  message?: string;
  data?: {
    origin_village_code: string;
    destination_village_code: string;
    weight: number;
    couriers: ExternalCourier[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await rateLimiters.standard.limit(ip);
    if (!success) {
      return rateLimited(60);
    }

    const { searchParams } = new URL(request.url);
    const destinationVillageCode = searchParams.get("destination_village_code");
    const weightParam = searchParams.get("weight");

    if (!destinationVillageCode) {
      return badRequest("destination_village_code wajib diisi");
    }

    const weight = Math.max(1, parseInt(weightParam || "1", 10) || 1);

    // Strip dots from village codes (wilayah API returns "15.71.09.1003", api.co.id needs "1571091003")
    const cleanDestCode = destinationVillageCode.replace(/\./g, "");

    // Get origin village code from site settings
    const originSetting = await prisma.siteSetting.findUnique({
      where: { key: "origin_village_code" },
    });

    if (!originSetting?.value) {
      return badRequest("Kode kelurahan asal belum dikonfigurasi di pengaturan admin");
    }

    const apiKey = process.env.API_CO_ID_KEY;
    if (!apiKey) {
      return badRequest("API_CO_ID_KEY belum dikonfigurasi");
    }

    // Call external API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const url = new URL("https://use.api.co.id/expedition/shipping-cost");
      url.searchParams.set("origin_village_code", originSetting.value);
      url.searchParams.set("destination_village_code", cleanDestCode);
      url.searchParams.set("weight", String(weight));

      console.log("[shipping-cost] Calling api.co.id:", url.toString());

      const apiRes = await fetch(url.toString(), {
        headers: { "x-api-co-id": apiKey },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const apiData = (await apiRes.json()) as ExternalApiResponse;
      console.log("[shipping-cost] Response:", JSON.stringify(apiData));

      if (!apiRes.ok) {
        console.error("api.co.id returned non-OK response:", {
          status: apiRes.status,
          body: apiData,
        });
        return badRequest(SHIPPING_API_UNAVAILABLE_MESSAGE);
      }

      if (!apiData.is_success || !apiData.data?.couriers) {
        console.error("api.co.id returned invalid payload:", apiData);
        return badRequest(SHIPPING_API_UNAVAILABLE_MESSAGE);
      }

      // Filter out couriers with price <= 0
      const couriers = filterAllowedShippingCouriers(apiData.data.couriers)
        .filter((c) => c.price > 0)
        .map((c) => ({
          courier_code: c.courier_code,
          courier_name: c.courier_name,
          price: c.price,
          estimation: c.estimation,
        }));

      if (couriers.length === 0) {
        return badRequest(NO_ALLOWED_COURIER_MESSAGE);
      }

      return apiSuccess({ mode: "api" as const, couriers });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return badRequest(SHIPPING_API_UNAVAILABLE_MESSAGE);
      }
      console.error("api.co.id request failed:", err);
      return badRequest(SHIPPING_API_UNAVAILABLE_MESSAGE);
    }
  } catch (error) {
    console.error("GET /api/shipping-cost error:", error);
    return serverError();
  }
}
