/**
 * Client for api.co.id Expedition Shipping Cost API.
 * @see https://docs.api.co.id/products/indonesia-expedition-cost
 */

import {
  isValidVillageCode,
  normalizeVillageCode,
} from "@/lib/village-code";

export const EXPEDITION_SHIPPING_API_URL =
  "https://use.api.co.id/expedition/shipping-cost";

export interface ExpeditionCourier {
  courier_code: string;
  courier_name: string;
  price: number;
  weight: number;
  estimation: string | null;
}

export interface ExpeditionShippingResponse {
  is_success: boolean;
  message?: string;
  data?: {
    origin_village_code: string;
    destination_village_code: string;
    weight: number;
    couriers: ExpeditionCourier[];
  };
}

export async function fetchExpeditionShippingCost(params: {
  originVillageCode: string;
  destinationVillageCode: string;
  weight: number;
  apiKey: string;
  signal?: AbortSignal;
}): Promise<ExpeditionShippingResponse> {
  const origin = normalizeVillageCode(params.originVillageCode);
  const destination = normalizeVillageCode(params.destinationVillageCode);
  const weight = Math.max(1, Math.floor(params.weight) || 1);

  if (!isValidVillageCode(origin) || !isValidVillageCode(destination)) {
    return {
      is_success: false,
      message: "Kode kelurahan asal atau tujuan tidak valid",
    };
  }

  const url = new URL(EXPEDITION_SHIPPING_API_URL);
  url.searchParams.set("origin_village_code", origin);
  url.searchParams.set("destination_village_code", destination);
  url.searchParams.set("weight", String(weight));

  const apiRes = await fetch(url.toString(), {
    headers: { "x-api-co-id": params.apiKey },
    signal: params.signal,
  });

  const apiData = (await apiRes.json()) as ExpeditionShippingResponse;

  if (!apiRes.ok) {
    return {
      is_success: false,
      message: apiData.message ?? `HTTP ${apiRes.status}`,
    };
  }

  return apiData;
}
