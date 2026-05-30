"use client";

import { cn } from "@/lib/utils";
import {
  useProvinces,
  useRegencies,
  useDistricts,
  useVillages,
  type WilayahItem,
} from "@/hooks/use-wilayah";
import { WilayahSelect } from "@/components/wilayah/wilayah-select";

export interface AddressData {
  province: { code: string; name: string } | null;
  regency: { code: string; name: string } | null;
  district: { code: string; name: string } | null;
  village: { code: string; name: string } | null;
  streetAddress: string;
  postalCode: string;
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
        <label className="block text-[13px] font-semibold text-[#6b5b4b] ml-1">
          Provinsi
        </label>
        <WilayahSelect
          placeholder="Pilih Provinsi"
          items={provinces}
          value={value.province?.code ?? null}
          onChange={handleProvinceChange}
          isLoading={loadingProvinces}
          error={errors.province?.message}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-[#6b5b4b] ml-1">
          Kota / Kabupaten
        </label>
        <WilayahSelect
          placeholder="Pilih Kota/Kabupaten"
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
          <label className="block text-[13px] font-semibold text-[#6b5b4b] ml-1">
            Kecamatan
          </label>
          <WilayahSelect
            placeholder="Pilih Kecamatan"
            items={districts}
            value={value.district?.code ?? null}
            onChange={handleDistrictChange}
            isLoading={loadingDistricts}
            disabled={!value.regency}
            error={errors.district?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-[#6b5b4b] ml-1">
            Kelurahan
          </label>
          <WilayahSelect
            placeholder="Pilih Kelurahan"
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
          className="block text-[13px] font-semibold text-[#6b5b4b] ml-1"
        >
          Alamat Lengkap
        </label>
        <input
          id="streetAddress"
          value={value.streetAddress}
          onChange={handleStreetChange}
          placeholder="Nama jalan, nomor rumah, RT/RW, Kompleks/Cluster"
          className={cn(
            "h-14 w-full rounded-full bg-[#faf6f0] border px-6 text-[16px]",
            "text-[#2d241c] font-medium placeholder:text-[#9a8772]",
            "focus:outline-none focus:border-[#c85a2d] focus:bg-white transition-colors",
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
          className="block text-[13px] font-semibold text-[#6b5b4b] ml-1"
        >
          Kode Pos
        </label>
        <input
          id="postalCode"
          value={value.postalCode}
          onChange={handlePostalChange}
          placeholder="12345"
          className={cn(
            "h-14 w-full rounded-full bg-[#faf6f0] border px-6 text-[16px]",
            "text-[#2d241c] font-medium placeholder:text-[#9a8772]",
            "focus:outline-none focus:border-[#c85a2d] focus:bg-white transition-colors",
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
