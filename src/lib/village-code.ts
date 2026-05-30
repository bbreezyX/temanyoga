export function normalizeVillageCode(code: string): string {
  return code.replace(/\./g, "").trim();
}

export function isValidVillageCode(code: string): boolean {
  return /^\d{10}$/.test(normalizeVillageCode(code));
}

export function villageCodeToDotted(code: string): string | null {
  const normalized = normalizeVillageCode(code);
  if (!isValidVillageCode(normalized)) {
    return null;
  }

  return `${normalized.slice(0, 2)}.${normalized.slice(2, 4)}.${normalized.slice(4, 6)}.${normalized.slice(6, 10)}`;
}

export function wilayahHierarchyCodesFromVillageCode(code: string) {
  const normalized = normalizeVillageCode(code);
  if (!isValidVillageCode(normalized)) {
    return null;
  }

  const provinceCode = normalized.slice(0, 2);
  const regencyCode = `${provinceCode}.${normalized.slice(2, 4)}`;
  const districtCode = `${regencyCode}.${normalized.slice(4, 6)}`;
  const villageCode = villageCodeToDotted(normalized)!;

  return {
    provinceCode,
    regencyCode,
    districtCode,
    villageCode,
    normalized,
  };
}
