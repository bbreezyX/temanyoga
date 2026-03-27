type CourierLike = {
  courier_code?: string | null;
  courier_name?: string | null;
};

export const NO_ALLOWED_COURIER_MESSAGE =
  "Belum ada layanan JNE, J&T, Lion Parcel, atau AnterAja untuk alamat ini. Coba periksa kembali kelurahan tujuan atau hubungi admin untuk bantuan pengiriman.";

export const SHIPPING_API_UNAVAILABLE_MESSAGE =
  "Layanan cek ongkir sedang bermasalah. Coba beberapa saat lagi atau hubungi admin untuk bantuan pengiriman manual.";

const ALLOWED_COURIER_IDENTIFIERS = new Set([
  "jne",
  "jnt",
  "jntexpress",
  "jt",
  "jtexpress",
  "lion",
  "lionparcel",
  "anteraja",
  "anterajaexpress",
]);

function normalizeCourierIdentifier(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function isAllowedShippingCourier(courier: CourierLike) {
  const normalizedCode = normalizeCourierIdentifier(courier.courier_code);
  const normalizedName = normalizeCourierIdentifier(courier.courier_name);

  return (
    ALLOWED_COURIER_IDENTIFIERS.has(normalizedCode) ||
    ALLOWED_COURIER_IDENTIFIERS.has(normalizedName)
  );
}

export function filterAllowedShippingCouriers<T extends CourierLike>(couriers: T[]) {
  return couriers.filter((courier) => isAllowedShippingCourier(courier));
}