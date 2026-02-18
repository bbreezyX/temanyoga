import useSWR from "swr";

export interface WilayahItem {
  code: string;
  name: string;
}

export interface WilayahResponse {
  data: WilayahItem[];
  meta?: {
    administrative_area_level: number;
    updated_at: string;
  };
}

const fetcher = async (url: string): Promise<WilayahResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch wilayah data");
  }
  return res.json();
};

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 3600000,
};

export function useProvinces() {
  return useSWR<WilayahResponse>("/api/wilayah?type=provinces", fetcher, SWR_CONFIG);
}

export function useRegencies(provinceCode: string | null) {
  return useSWR<WilayahResponse>(
    provinceCode ? `/api/wilayah?type=regencies&code=${provinceCode}` : null,
    fetcher,
    SWR_CONFIG,
  );
}

export function useDistricts(regencyCode: string | null) {
  return useSWR<WilayahResponse>(
    regencyCode ? `/api/wilayah?type=districts&code=${regencyCode}` : null,
    fetcher,
    SWR_CONFIG,
  );
}

export function useVillages(districtCode: string | null) {
  return useSWR<WilayahResponse>(
    districtCode ? `/api/wilayah?type=villages&code=${districtCode}` : null,
    fetcher,
    SWR_CONFIG,
  );
}