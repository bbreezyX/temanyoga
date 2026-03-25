# Plan: Integrasi API Cek Ongkir Otomatis

## Latar Belakang

Saat ini pembeli memilih zona pengiriman secara manual (diatur admin), dengan harga fixed per zona.
Tujuan: ganti dengan cek ongkir otomatis — setelah pembeli memilih kelurahan, sistem otomatis
mengambil daftar kurir (JNE, J&T, SiCepat, dll) beserta harganya dari API eksternal
[api.co.id](https://api.co.id/api-cek-ongkos-kirim/).

Sistem ShippingZone lama **dipertahankan** sebagai fallback jika API eksternal gagal.

---

## API Eksternal: api.co.id

**Endpoint:**
```
GET https://use.api.co.id/expedition/shipping-cost
  ?origin_village_code=3204282001
  &destination_village_code=3204402005
  &weight=1

Headers:
  x-api-co-id: YOUR_API_KEY
```

**Response sukses:**
```json
{
  "is_success": true,
  "data": {
    "origin_village_code": "3204282001",
    "destination_village_code": "3204402005",
    "weight": 1,
    "couriers": [
      {
        "courier_code": "JNE",
        "courier_name": "JNE Express",
        "price": 8000,
        "weight": 1,
        "estimation": "2 - 3 days"
      }
    ]
  }
}
```

**Catatan penting:**
- `origin_village_code` = kode 10-digit kelurahan asal (gudang/toko), diisi admin sekali di SiteSetting
- `destination_village_code` = kode 10-digit kelurahan tujuan dari form alamat pembeli (sudah tersedia di `AddressData.village.code`)
- `weight` = berat dalam kg. Untuk sementara: **1 kg per item** (total = jumlah seluruh item di cart)
- Hanya kurir dengan `price > 0` yang dikembalikan API
- `estimation` bisa `null` untuk beberapa kurir

---

## Alur Kerja Baru (Flow)

```
Pembeli isi form checkout
        ↓
Pilih kelurahan (village) di AddressFields
        ↓
Trigger otomatis: GET /api/shipping-cost?destination_village_code=xxx&weight=N
        ↓
    ┌─────────────────────────────────────────────────────┐
    │  api.co.id berhasil         │  api.co.id gagal      │
    │  → mode: "api"              │  → mode: "fallback"   │
    │  → tampilkan daftar kurir   │  → tampilkan zona     │
    │    (JNE, J&T, SiCepat, dll) │    manual dari DB     │
    └─────────────────────────────────────────────────────┘
        ↓
Pembeli pilih kurir / zona → shippingCost ter-update
        ↓
Submit order → POST /api/orders
        ↓
    ┌─────────────────────────────────────────────────────┐
    │  mode "api"                 │  mode "fallback"      │
    │  → re-verify harga ke       │  → validasi zona      │
    │    api.co.id (server-side)  │    seperti sekarang   │
    │  → shippingCost = harga API │  → shippingCost =     │
    │  → snapshot kurir terpilih  │    zona.price         │
    └─────────────────────────────────────────────────────┘
        ↓
Order tersimpan di DB
```

---

## Keputusan Desain

| Aspek | Keputusan |
|---|---|
| Berat produk | 1 kg per item (total = jumlah item di cart) |
| Origin village code | Disimpan di `SiteSetting` dengan key `origin_village_code`, diisi admin sekali |
| Fallback | Jika API gagal → tampilkan ShippingZone manual (sistem lama) |
| Server-side validation | Backend **re-verify** harga ke api.co.id saat order dibuat (mencegah manipulasi) |
| Data tersimpan di order | Reuse field `shippingZoneSnapshot` untuk menyimpan snapshot kurir terpilih |
| Schema change | **Tidak ada** perubahan Prisma schema (reuse field yang sudah ada) |

---

## Daftar Perubahan File

### File Baru

| File | Deskripsi |
|---|---|
| `src/app/api/shipping-cost/route.ts` | Proxy internal ke api.co.id + fallback ke ShippingZone |

### File Diubah

| File | Perubahan |
|---|---|
| `.env` | Tambah `API_CO_ID_KEY` |
| `src/lib/validations/settings.ts` | Tambah `origin_village_code` ke `SETTING_KEYS` + `updateSettingsSchema` |
| `src/lib/validations/order.ts` | Tambah `destinationVillageCode`, `selectedCourierCode`, `selectedCourierName` (semua optional) |
| `src/types/api.ts` | Tambah `CourierOption`, `ShippingCostResponse` types |
| `src/app/api/orders/route.ts` | Handle dua mode: kurir API (re-verify) vs fallback zona |
| `src/app/(customer)/checkout/checkout-client.tsx` | UI pilih kurir, trigger fetch on village select |
| `src/app/(admin)/admin/settings/` | Tambah input `origin_village_code` di form settings |

---

## Detail Implementasi Per File

### 1. `.env`

```env
# Tambahkan:
API_CO_ID_KEY=your_api_key_here
```

---

### 2. `src/app/api/shipping-cost/route.ts` (BARU)

```ts
// GET /api/shipping-cost?destination_village_code=xxxx&weight=2
//
// Logic:
// 1. Validasi query params (destination_village_code wajib, weight default 1)
// 2. Baca origin_village_code dari prisma.siteSetting (key: "origin_village_code")
// 3. Jika origin_village_code kosong → langsung fallback ke ShippingZone
// 4. Panggil api.co.id dengan fetch() + header x-api-co-id
// 5. Jika berhasil → return { mode: "api", couriers: [...] }
// 6. Jika gagal (network error / 4xx / 5xx / village not supported) →
//    query ShippingZone aktif dari DB → return { mode: "fallback", zones: [...] }
//
// Rate limit: standard (10 req / 60s)
// Cache: tidak (harga real-time)
```

**Response shape:**
```ts
// Mode API berhasil:
{
  mode: "api",
  couriers: [
    {
      courier_code: "JNE",
      courier_name: "JNE Express",
      price: 8000,
      estimation: "2 - 3 days" | null
    }
  ]
}

// Mode fallback:
{
  mode: "fallback",
  zones: [
    { id: "...", name: "Jabodetabek", description: "...", price: 15000 }
  ]
}
```

---

### 3. `src/lib/validations/settings.ts`

Tambahkan di `SETTING_KEYS`:
```ts
export const SETTING_KEYS = [
  // ... existing keys ...
  "origin_village_code",   // NEW: kode kelurahan asal untuk cek ongkir
] as const;
```

Tambahkan di `updateSettingsSchema`:
```ts
origin_village_code: z.string().max(10).optional(),
```

---

### 4. `src/lib/validations/order.ts`

Tambah field opsional di `createOrderSchema`:
```ts
// Untuk mode API cek ongkir (salah satu dari dua mode harus ada):
destinationVillageCode: z.string().max(10).optional(),   // untuk re-verify harga
selectedCourierCode:    z.string().max(50).optional(),   // "JNE", "JT", dll
selectedCourierName:    z.string().max(100).optional(),  // "JNE Express"

// shippingZoneId tetap ada untuk mode fallback
// shippingZoneId sekarang menjadi optional (bukan required)
```

**Catatan:** Tambah custom refinement `.refine()` di level schema:
```ts
// Wajib salah satu: (shippingZoneId) ATAU (destinationVillageCode + selectedCourierCode)
.refine(
  (data) => data.shippingZoneId || (data.destinationVillageCode && data.selectedCourierCode),
  { message: "Wajib pilih kurir atau zona pengiriman" }
)
```

---

### 5. `src/types/api.ts`

Tambah types baru:
```ts
export interface CourierOption {
  courier_code: string;
  courier_name: string;
  price: number;
  estimation: string | null;
}

export interface ShippingCostResponse {
  mode: "api" | "fallback";
  couriers?: CourierOption[];   // jika mode "api"
  zones?: ShippingZone[];       // jika mode "fallback"
}
```

---

### 6. `src/app/api/orders/route.ts`

Ubah bagian validasi & kalkulasi ongkir:

```ts
// Sebelum:
const shippingZone = await prisma.shippingZone.findUnique({ where: { id: shippingZoneId } });
if (!shippingZone || !shippingZone.isActive) return badRequest("...");
const shippingCost = shippingZone.price;
const shippingZoneSnapshot = JSON.stringify({ name: shippingZone.name, price: shippingZone.price });

// Sesudah (pseudocode):
let shippingCost: number;
let shippingZoneSnapshot: string;
let resolvedShippingZoneId: string | null = shippingZoneId ?? null;

if (destinationVillageCode && selectedCourierCode) {
  // MODE API: re-verify harga ke api.co.id
  const weight = items.reduce((sum, item) => sum + item.quantity, 0); // 1 kg per item
  const originVillageCode = await getSiteSettingValue("origin_village_code");

  const apiRes = await fetch(
    `https://use.api.co.id/expedition/shipping-cost?...`,
    { headers: { "x-api-co-id": process.env.API_CO_ID_KEY! } }
  );
  const apiData = await apiRes.json();

  if (!apiData.is_success) return badRequest("Ongkir tidak dapat diverifikasi");

  const courier = apiData.data.couriers.find(c => c.courier_code === selectedCourierCode);
  if (!courier) return badRequest("Kurir tidak tersedia untuk rute ini");

  shippingCost = courier.price;
  shippingZoneSnapshot = JSON.stringify({
    mode: "api",
    courier_code: courier.courier_code,
    courier_name: courier.courier_name,
    price: courier.price,
    estimation: courier.estimation,
  });
  resolvedShippingZoneId = null; // tidak pakai zona DB

} else if (shippingZoneId) {
  // MODE FALLBACK: pakai zona DB seperti sekarang
  const shippingZone = await prisma.shippingZone.findUnique({ where: { id: shippingZoneId } });
  if (!shippingZone || !shippingZone.isActive) return badRequest("Zona pengiriman tidak valid");
  shippingCost = shippingZone.price;
  shippingZoneSnapshot = JSON.stringify({ mode: "fallback", name: shippingZone.name, price: shippingZone.price });

} else {
  return badRequest("Wajib pilih kurir atau zona pengiriman");
}
```

---

### 7. `src/app/(customer)/checkout/checkout-client.tsx`

**State baru (ganti state zona lama):**
```ts
// Hapus:
// const [zones, setZones] = useState<ShippingZone[]>([]);
// const [zonesLoading, setZonesLoading] = useState(true);
// const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

// Tambah:
const [shippingResult, setShippingResult] = useState<ShippingCostResponse | null>(null);
const [shippingLoading, setShippingLoading] = useState(false);
const [shippingError, setShippingError] = useState<string | null>(null);

// Pilihan yang dipilih pembeli:
const [selectedCourierCode, setSelectedCourierCode] = useState<string | null>(null);
const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null); // untuk fallback

// Derived:
const shippingCost = (() => {
  if (shippingResult?.mode === "api") {
    return shippingResult.couriers?.find(c => c.courier_code === selectedCourierCode)?.price ?? 0;
  }
  if (shippingResult?.mode === "fallback") {
    return shippingResult.zones?.find(z => z.id === selectedZoneId)?.price ?? 0;
  }
  return 0;
})();
```

**Trigger fetch saat village berubah:**
```ts
// Di AddressFields onChange, saat village ter-set:
useEffect(() => {
  if (!addressData.village?.code) {
    setShippingResult(null);
    setSelectedCourierCode(null);
    setSelectedZoneId(null);
    return;
  }

  const weight = items.reduce((sum, i) => sum + i.quantity, 0) || 1;
  setShippingLoading(true);
  setShippingError(null);

  apiFetch<ShippingCostResponse>(
    `/api/shipping-cost?destination_village_code=${addressData.village.code}&weight=${weight}`
  ).then((res) => {
    if (res.success) {
      setShippingResult(res.data);
      setSelectedCourierCode(null);
      setSelectedZoneId(null);
    } else {
      setShippingError("Gagal memuat ongkos kirim. Coba lagi.");
    }
  }).finally(() => setShippingLoading(false));
}, [addressData.village?.code]);
```

**UI — tampilan pilih kurir:**
```
Ongkos Kirim
─────────────────────────────────────────
[Loading spinner jika shippingLoading]

[Jika mode "api"]
○ JNE Express      Rp 8.000   (2-3 hari)
○ J&T Express      Rp 13.000
○ SiCepat Express  Rp 10.000  (1-2 hari)

[Jika mode "fallback"]
○ Jabodetabek      Rp 15.000
○ Jawa Tengah      Rp 20.000

[Jika belum pilih village]
→ "Pilih kelurahan terlebih dahulu untuk melihat pilihan ongkir"
```

**onSubmit — payload order:**
```ts
// Mode API:
{
  ...customerData,
  destinationVillageCode: addressData.village.code,
  selectedCourierCode: selectedCourierCode,
  selectedCourierName: shippingResult.couriers.find(...).courier_name,
  // shippingZoneId: tidak dikirim
}

// Mode fallback:
{
  ...customerData,
  shippingZoneId: selectedZoneId,
  // destinationVillageCode, selectedCourierCode: tidak dikirim
}
```

---

### 8. Admin Settings — tambah field `origin_village_code`

Di form settings admin, tambah section baru "Pengiriman" dengan input:
```
Label:       "Kode Kelurahan Asal (Origin Village Code)"
Placeholder: "Contoh: 3204282001"
Helper:      "Kode 10 digit kelurahan asal pengiriman. Dapatkan dari wilayah.id"
```

Ini diperlukan agar admin bisa mengubah kode asal tanpa deploy ulang.

---

## Urutan Implementasi

```
Step 1  Tambah API_CO_ID_KEY ke .env
Step 2  Update settings validation + admin UI (origin_village_code)
Step 3  Buat /api/shipping-cost/route.ts
Step 4  Update types/api.ts (CourierOption, ShippingCostResponse)
Step 5  Update createOrderSchema (field baru + refinement)
Step 6  Update POST /api/orders (handle dua mode)
Step 7  Update checkout-client.tsx (UI + state + fetch logic)
Step 8  Manual test: checkout flow end-to-end
```

---

## Edge Cases & Handling

| Kasus | Handling |
|---|---|
| `origin_village_code` belum diset admin | Langsung fallback ke zona DB |
| API timeout (> 5 detik) | `AbortController` + fallback ke zona DB |
| Kelurahan belum didukung API ("village not supported") | Fallback ke zona DB + log warning |
| Tidak ada zona fallback di DB | Tampilkan pesan error "Ongkir tidak tersedia, hubungi kami" |
| Harga kurir berubah antara pilih & submit | Re-verify server-side menangkap ini, order ditolak dengan pesan "Harga ongkir berubah, silakan pilih ulang" |
| Cart kosong saat fetch ongkir | `weight` minimal 1 |
| Village code berubah setelah kurir dipilih | Reset pilihan kurir saat village berubah |

---

## Environment Variables

```env
# .env (tambahkan):
API_CO_ID_KEY=your_key_from_dashboard_api_co_id

# Cara dapat API key:
# 1. Daftar di https://dashboard.api.co.id
# 2. Buat project baru
# 3. Copy API key dari dashboard
```

---

## Referensi

- [Dokumentasi API Cek Ongkir](https://docs.api.co.id/api/indonesia-expedition-cost)
- [Dashboard api.co.id](https://dashboard.api.co.id)
- [API Wilayah Indonesia](https://api.co.id/indonesia-regional-api/) — untuk cari kode kelurahan asal
