import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError, rateLimited } from "@/lib/api-response";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import {
  fetchExpeditionShippingCost,
} from "@/lib/expedition-shipping";
import {
  isValidVillageCode,
  normalizeVillageCode,
} from "@/lib/village-code";
import {
  filterAllowedShippingCouriers,
  NO_ALLOWED_COURIER_MESSAGE,
  SHIPPING_API_UNAVAILABLE_MESSAGE,
} from "@/lib/shipping-couriers";
import type { CourierOption, ShippingCostResponse, ShippingZone } from "@/types/api";

async function getActiveShippingZones(): Promise<ShippingZone[]> {
  return prisma.shippingZone.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true, price: true },
    orderBy: { sortOrder: "asc" },
  });
}

function fallbackResponse(zones: ShippingZone[]) {
  if (zones.length === 0) {
    return badRequest(SHIPPING_API_UNAVAILABLE_MESSAGE);
  }

  const response: ShippingCostResponse = {
    mode: "fallback",
    zones,
  };
  return apiSuccess(response);
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

    const cleanDestCode = normalizeVillageCode(destinationVillageCode);
    if (!isValidVillageCode(cleanDestCode)) {
      return badRequest("Kode kelurahan tujuan tidak valid");
    }

    const weight = Math.max(1, parseInt(weightParam || "1", 10) || 1);

    const originSetting = await prisma.siteSetting.findUnique({
      where: { key: "origin_village_code" },
    });

    const apiKey = process.env.API_CO_ID_KEY;
    const originCode = originSetting?.value
      ? normalizeVillageCode(originSetting.value)
      : "";

    if (!apiKey || !originCode || !isValidVillageCode(originCode)) {
      return fallbackResponse(await getActiveShippingZones());
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const apiData = await fetchExpeditionShippingCost({
        originVillageCode: originCode,
        destinationVillageCode: cleanDestCode,
        weight,
        apiKey,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!apiData.is_success || !apiData.data?.couriers) {
        return fallbackResponse(await getActiveShippingZones());
      }

      const couriers: CourierOption[] = filterAllowedShippingCouriers(
        apiData.data.couriers,
      )
        .filter((c) => c.price > 0)
        .map((c) => ({
          courier_code: c.courier_code,
          courier_name: c.courier_name,
          price: c.price,
          estimation: c.estimation,
        }))
        .sort((a, b) => a.price - b.price);

      if (couriers.length === 0) {
        const zones = await getActiveShippingZones();
        if (zones.length > 0) {
          return fallbackResponse(zones);
        }
        return badRequest(NO_ALLOWED_COURIER_MESSAGE);
      }

      const response: ShippingCostResponse = {
        mode: "api",
        couriers,
      };
      return apiSuccess(response);
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        return fallbackResponse(await getActiveShippingZones());
      }
      console.error("api.co.id request failed:", err);
      return fallbackResponse(await getActiveShippingZones());
    }
  } catch (error) {
    console.error("GET /api/shipping-cost error:", error);
    return serverError();
  }
}
