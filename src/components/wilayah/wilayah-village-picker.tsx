"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  useProvinces,
  useRegencies,
  useDistricts,
  useVillages,
  type WilayahItem,
} from "@/hooks/use-wilayah";
import { WilayahSelect } from "@/components/wilayah/wilayah-select";
import {
  formatWilayahVillageLabel,
  verifyVillageCode,
  type VerifyVillageCodeResult,
  type WilayahVillageSelection,
} from "@/lib/resolve-wilayah-village";
import {
  isValidVillageCode,
  normalizeVillageCode,
} from "@/lib/village-code";

export type { WilayahVillageSelection, VerifyVillageCodeResult };

interface WilayahVillagePickerProps {
  value: WilayahVillageSelection;
  onChange: (
    selection: WilayahVillageSelection,
    normalizedVillageCode: string | null,
  ) => void;
  initialVillageCode?: string;
  variant?: "customer" | "admin";
  onVerifyResult?: (result: VerifyVillageCodeResult) => void;
}

const EMPTY_SELECTION: WilayahVillageSelection = {
  province: null,
  regency: null,
  district: null,
  village: null,
};

export function WilayahVillagePicker({
  value,
  onChange,
  initialVillageCode = "",
  variant = "admin",
  onVerifyResult,
}: WilayahVillagePickerProps) {
  const [resolving, setResolving] = useState(false);
  const [resolvedCode, setResolvedCode] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: provincesData, isLoading: loadingProvinces } = useProvinces();
  const { data: regenciesData, isLoading: loadingRegencies } = useRegencies(
    value.province?.code ?? null,
  );
  const { data: districtsData, isLoading: loadingDistricts } = useDistricts(
    value.regency?.code ?? null,
  );
  const { data: villagesData, isLoading: loadingVillages } = useVillages(
    value.district?.code ?? null,
  );

  useEffect(() => {
    const normalized = normalizeVillageCode(initialVillageCode);
    if (!normalized || normalized === resolvedCode) {
      return;
    }

    if (!isValidVillageCode(normalized)) {
      const result: VerifyVillageCodeResult = {
        status: "invalid",
        message:
          "Kode tersimpan tidak valid. Pilih ulang kelurahan atau perbaiki kode manual.",
      };
      setVerifyNotice({ type: "error", message: result.message });
      onVerifyResult?.(result);
      return;
    }

    let cancelled = false;

    async function hydrateFromSavedCode() {
      setResolving(true);
      setVerifyNotice(null);

      const result = await verifyVillageCode(normalized);
      if (cancelled) {
        return;
      }

      onVerifyResult?.(result);

      if (result.status === "found") {
        onChange(result.selection, result.normalized);
        setResolvedCode(result.normalized);
        setVerifyNotice({
          type: "success",
          message: `Kode ${result.normalized} ditemukan: ${formatWilayahVillageLabel(result.selection) ?? result.selection.village?.name ?? ""}`,
        });
      } else {
        setVerifyNotice({
          type: "error",
          message: result.message,
        });
      }

      setResolving(false);
    }

    void hydrateFromSavedCode();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per saved code
  }, [initialVillageCode, resolvedCode]);

  function updateSelection(next: WilayahVillageSelection) {
    const normalized = next.village
      ? normalizeVillageCode(next.village.code)
      : null;

    onChange(
      next,
      normalized && isValidVillageCode(normalized) ? normalized : null,
    );

    if (normalized && isValidVillageCode(normalized)) {
      setResolvedCode(normalized);
      setVerifyNotice({
        type: "success",
        message: `Kode ${normalized} — ${formatWilayahVillageLabel(next) ?? next.village?.name ?? "Kelurahan terpilih"}`,
      });
      onVerifyResult?.({
        status: "found",
        normalized,
        selection: next,
      });
    } else {
      setVerifyNotice(null);
    }
  }

  function handleProvinceChange(item: WilayahItem | null) {
    updateSelection({
      province: item,
      regency: null,
      district: null,
      village: null,
    });
  }

  function handleRegencyChange(item: WilayahItem | null) {
    updateSelection({
      ...value,
      regency: item,
      district: null,
      village: null,
    });
  }

  function handleDistrictChange(item: WilayahItem | null) {
    updateSelection({
      ...value,
      district: item,
      village: null,
    });
  }

  function handleVillageChange(item: WilayahItem | null) {
    updateSelection({
      ...value,
      village: item,
    });
  }

  const labelClass =
    variant === "admin"
      ? "text-xs font-bold text-warm-gray uppercase tracking-wider"
      : "block text-[13px] font-semibold text-[#6b5b4b] ml-1";

  return (
    <div className="space-y-4">
      {verifyNotice && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            verifyNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role="status"
        >
          {verifyNotice.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          )}
          <p>{verifyNotice.message}</p>
        </div>
      )}

      <div className="grid gap-3">
        <div className="space-y-2">
          <label className={labelClass}>Provinsi</label>
          <WilayahSelect
            variant={variant}
            placeholder="Pilih provinsi"
            items={provincesData?.data}
            value={value.province?.code ?? null}
            onChange={handleProvinceChange}
            isLoading={loadingProvinces || resolving}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Kota / Kabupaten</label>
          <WilayahSelect
            variant={variant}
            placeholder="Pilih kota/kabupaten"
            items={regenciesData?.data}
            value={value.regency?.code ?? null}
            onChange={handleRegencyChange}
            isLoading={loadingRegencies || resolving}
            disabled={!value.province}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Kecamatan</label>
            <WilayahSelect
              variant={variant}
              placeholder="Pilih kecamatan"
              items={districtsData?.data}
              value={value.district?.code ?? null}
              onChange={handleDistrictChange}
              isLoading={loadingDistricts || resolving}
              disabled={!value.regency}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Kelurahan / Desa</label>
            <WilayahSelect
              variant={variant}
              placeholder="Pilih kelurahan/desa"
              items={villagesData?.data}
              value={value.village?.code ?? null}
              onChange={handleVillageChange}
              isLoading={loadingVillages || resolving}
              disabled={!value.district}
            />
          </div>
        </div>
      </div>

      {value.village && (
        <div className="rounded-xl border border-warm-sand/40 bg-cream/20 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-warm-gray">
            Kode kelurahan terpilih
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-dark-brown">
            {normalizeVillageCode(value.village.code)}
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            {formatWilayahVillageLabel(value) ?? value.village.name}
          </p>
        </div>
      )}
    </div>
  );
}
