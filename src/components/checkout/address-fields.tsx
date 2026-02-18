"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProvinces,
  useRegencies,
  useDistricts,
  useVillages,
  type WilayahItem,
} from "@/hooks/use-wilayah";

export interface AddressData {
  province: { code: string; name: string } | null;
  regency: { code: string; name: string } | null;
  district: { code: string; name: string } | null;
  village: { code: string; name: string } | null;
  streetAddress: string;
  postalCode: string;
}

interface WilayahSelectProps {
  placeholder: string;
  items: WilayahItem[] | undefined;
  value: string | null;
  onChange: (item: WilayahItem | null) => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string;
}

function WilayahSelect({
  placeholder,
  items,
  value,
  onChange,
  isLoading,
  disabled,
  error,
}: WilayahSelectProps) {
  if (isLoading) {
    return (
      <div className="h-14 w-full rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] px-6 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-[#c85a2d]" />
        <span className="text-[14px] text-[#9a8772]">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value ?? undefined}
        onValueChange={(val) => {
          const item = items?.find((i) => i.code === val);
          onChange(item ?? null);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "!h-14 w-full !rounded-2xl bg-[#f9f9f9] border-[#e8dcc8] px-6 text-[16px]",
            "text-[#2d241c] font-medium",
            "focus:ring-0 focus:border-[#c85a2d] focus:shadow-none",
            "data-[placeholder]:text-[#9a8772]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-300",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="max-h-60 rounded-2xl w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={4}
        >
          <div className="max-h-56 overflow-y-auto p-1">
            {items?.map((item) => (
              <SelectItem
                key={item.code}
                value={item.code}
                className="text-[15px] font-medium py-3 px-3 rounded-xl focus:bg-[#fdf8f6] focus:text-[#2d241c]"
              >
                {item.name}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500 font-medium px-1">{error}</p>
      )}
    </div>
  );
}

interface AddressFieldsProps {
  value: AddressData;
  onChange: (value: AddressData) => void;
  errors: {
    province?: { message?: string };
    regency?: { message?: string };
    district?: { message?: string };
    village?: { message?: string };
    streetAddress?: { message?: string };
    postalCode?: { message?: string };
  };
}

export function AddressFields({ value, onChange, errors }: AddressFieldsProps) {
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

  const provinces = provincesData?.data;
  const regencies = regenciesData?.data;
  const districts = districtsData?.data;
  const villages = villagesData?.data;

  const handleProvinceChange = (item: WilayahItem | null) => {
    onChange({
      ...value,
      province: item ? { code: item.code, name: item.name } : null,
      regency: null,
      district: null,
      village: null,
    });
  };

  const handleRegencyChange = (item: WilayahItem | null) => {
    onChange({
      ...value,
      regency: item ? { code: item.code, name: item.name } : null,
      district: null,
      village: null,
    });
  };

  const handleDistrictChange = (item: WilayahItem | null) => {
    onChange({
      ...value,
      district: item ? { code: item.code, name: item.name } : null,
      village: null,
    });
  };

  const handleVillageChange = (item: WilayahItem | null) => {
    onChange({
      ...value,
      village: item ? { code: item.code, name: item.name } : null,
    });
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, streetAddress: e.target.value });
  };

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, postalCode: e.target.value });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]">
          Provinsi
        </label>
        <WilayahSelect
          placeholder="Pilih provinsi"
          items={provinces}
          value={value.province?.code ?? null}
          onChange={handleProvinceChange}
          isLoading={loadingProvinces}
          error={errors.province?.message}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]">
          Kota / Kabupaten
        </label>
        <WilayahSelect
          placeholder="Pilih kota/kabupaten"
          items={regencies}
          value={value.regency?.code ?? null}
          onChange={handleRegencyChange}
          isLoading={loadingRegencies}
          disabled={!value.province}
          error={errors.regency?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]">
            Kecamatan
          </label>
          <WilayahSelect
            placeholder="Pilih kecamatan"
            items={districts}
            value={value.district?.code ?? null}
            onChange={handleDistrictChange}
            isLoading={loadingDistricts}
            disabled={!value.regency}
            error={errors.district?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]">
            Kelurahan
          </label>
          <WilayahSelect
            placeholder="Pilih kelurahan"
            items={villages}
            value={value.village?.code ?? null}
            onChange={handleVillageChange}
            isLoading={loadingVillages}
            disabled={!value.district}
            error={errors.village?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="streetAddress"
          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
        >
          Alamat Lengkap
        </label>
        <input
          id="streetAddress"
          value={value.streetAddress}
          onChange={handleStreetChange}
          placeholder="Nama jalan, nomor rumah, RT/RW, Kompleks/Cluster"
          className={cn(
            "h-14 w-full rounded-2xl bg-[#f9f9f9] border px-6 text-[16px]",
            "text-[#2d241c] font-medium placeholder:text-[#9a8772]",
            "focus:outline-none focus:border-[#c85a2d] transition-all",
            errors.streetAddress ? "border-red-300" : "border-[#e8dcc8]",
          )}
        />
        {errors.streetAddress && (
          <p className="text-xs text-red-500 font-medium px-1">
            {errors.streetAddress.message}
          </p>
        )}
      </div>

      <div className="space-y-2 sm:w-1/2">
        <label
          htmlFor="postalCode"
          className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em]"
        >
          Kode Pos
        </label>
        <input
          id="postalCode"
          value={value.postalCode}
          onChange={handlePostalChange}
          placeholder="12345"
          className={cn(
            "h-14 w-full rounded-2xl bg-[#f9f9f9] border px-6 text-[16px]",
            "text-[#2d241c] font-medium placeholder:text-[#9a8772]",
            "focus:outline-none focus:border-[#c85a2d] transition-all",
            errors.postalCode ? "border-red-300" : "border-[#e8dcc8]",
          )}
        />
        {errors.postalCode && (
          <p className="text-xs text-red-500 font-medium px-1">
            {errors.postalCode.message}
          </p>
        )}
      </div>
    </div>
  );
}
