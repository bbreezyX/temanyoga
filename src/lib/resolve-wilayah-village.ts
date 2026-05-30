import type { WilayahItem, WilayahResponse } from "@/hooks/use-wilayah";
import {
  isValidVillageCode,
  normalizeVillageCode,
  wilayahHierarchyCodesFromVillageCode,
} from "@/lib/village-code";

export interface WilayahVillageSelection {
  province: WilayahItem | null;
  regency: WilayahItem | null;
  district: WilayahItem | null;
  village: WilayahItem | null;
}

export type VerifyVillageCodeResult =
  | {
      status: "found";
      normalized: string;
      selection: WilayahVillageSelection;
    }
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "not_found";
      normalized: string;
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

async function fetchWilayahList(
  type: "provinces" | "regencies" | "districts" | "villages",
  code?: string,
): Promise<WilayahItem[] | null> {
  const params = new URLSearchParams({ type });
  if (code) {
    params.set("code", code);
  }

  const res = await fetch(`/api/wilayah?${params.toString()}`);
  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as WilayahResponse;
  return json.data ?? null;
}

function findByCode(items: WilayahItem[] | null, code: string) {
  return items?.find((item) => item.code === code) ?? null;
}

function findVillageByNormalizedCode(
  items: WilayahItem[] | null,
  normalized: string,
) {
  return (
    items?.find(
      (item) => normalizeVillageCode(item.code) === normalized,
    ) ?? null
  );
}

export async function verifyVillageCode(
  rawCode: string,
): Promise<VerifyVillageCodeResult> {
  const normalized = normalizeVillageCode(rawCode);

  if (!isValidVillageCode(normalized)) {
    return {
      status: "invalid",
      message: "Format kode tidak valid. Harus 10 digit angka (contoh: 3204282001).",
    };
  }

  const hierarchy = wilayahHierarchyCodesFromVillageCode(normalized);
  if (!hierarchy) {
    return {
      status: "invalid",
      message: "Format kode tidak valid. Harus 10 digit angka (contoh: 3204282001).",
    };
  }

  try {
    const provinces = await fetchWilayahList("provinces");
    if (!provinces) {
      return {
        status: "error",
        message: "Gagal memuat data provinsi. Coba lagi beberapa saat.",
      };
    }

    const province = findByCode(provinces, hierarchy.provinceCode);
    if (!province) {
      return {
        status: "not_found",
        normalized,
        message: `Kode ${normalized} tidak ditemukan: provinsi tidak valid.`,
      };
    }

    const regencies = await fetchWilayahList("regencies", hierarchy.provinceCode);
    if (!regencies) {
      return {
        status: "error",
        message: "Gagal memuat data kabupaten/kota. Coba lagi beberapa saat.",
      };
    }

    const regency = findByCode(regencies, hierarchy.regencyCode);
    if (!regency) {
      return {
        status: "not_found",
        normalized,
        message: `Kode ${normalized} tidak ditemukan: kabupaten/kota tidak valid.`,
      };
    }

    const districts = await fetchWilayahList("districts", hierarchy.regencyCode);
    if (!districts) {
      return {
        status: "error",
        message: "Gagal memuat data kecamatan. Coba lagi beberapa saat.",
      };
    }

    const district = findByCode(districts, hierarchy.districtCode);
    if (!district) {
      return {
        status: "not_found",
        normalized,
        message: `Kode ${normalized} tidak ditemukan: kecamatan tidak valid.`,
      };
    }

    const villages = await fetchWilayahList("villages", hierarchy.districtCode);
    if (!villages) {
      return {
        status: "error",
        message: "Gagal memuat data kelurahan/desa. Coba lagi beberapa saat.",
      };
    }

    const village =
      findVillageByNormalizedCode(villages, normalized) ??
      findByCode(villages, hierarchy.villageCode);

    if (!village) {
      return {
        status: "not_found",
        normalized,
        message: `Kode kelurahan ${normalized} tidak ditemukan di database wilayah.`,
      };
    }

    return {
      status: "found",
      normalized,
      selection: { province, regency, district, village },
    };
  } catch {
    return {
      status: "error",
      message: "Gagal memverifikasi kode kelurahan. Periksa koneksi lalu coba lagi.",
    };
  }
}

/** @deprecated Use verifyVillageCode for structured result */
export async function resolveWilayahFromVillageCode(
  rawCode: string,
): Promise<WilayahVillageSelection | null> {
  const result = await verifyVillageCode(rawCode);
  return result.status === "found" ? result.selection : null;
}

export function formatWilayahVillageLabel(selection: WilayahVillageSelection) {
  if (!selection.village) {
    return null;
  }

  const parts = [
    selection.village.name,
    selection.district?.name,
    selection.regency?.name,
    selection.province?.name,
  ].filter(Boolean);

  return parts.join(", ");
}
