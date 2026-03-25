# Plan: Auto-Print Struk Thermal (80mm)

## Latar Belakang

Owner meminta struk pesanan otomatis tercetak ke thermal printer (80mm) saat:
1. **Order baru masuk** — customer submit checkout (`NEW_ORDER`)
2. **Customer upload bukti pembayaran** (`PAYMENT_PROOF_UPLOADED`)

Struk hanya untuk **admin** (bukan customer). Isi struk: detail lengkap (nama, alamat, items, harga, total, kode order).

---

## Cara Kerja (Flow)

```
Customer order / upload bukti pembayaran
        ↓
API route broadcast SSE via broadcastNotification()
        ↓
NotificationDropdown (admin dashboard) terima event SSE
        ↓
Cek apakah setting AUTO_PRINT_RECEIPT = "true"
        ↓
window.open('/admin/orders/[orderId]/print', '_blank', 'popup,width=420,height=900')
        ↓
Print page load → <AutoPrint /> component mount
        ↓
useEffect → window.print() → print dialog → cetak ke thermal printer
        ↓
window.close() setelah print selesai
```

> **Catatan popup blocker:** Popup yang dibuka dari SSE event (bukan user click) kemungkinan diblok browser.
> Solusi fallback: tampilkan toast dengan tombol "Print Sekarang" agar user bisa trigger manual.
> Admin perlu izinkan popup dari domain ini di pengaturan browser (sekali saja).

---

## Files yang Dibuat / Dimodifikasi

### 1. `src/app/(admin)/admin/orders/[id]/print/page.tsx` — **BUAT BARU**

- Server component, `await params` untuk `id`
- Query Prisma langsung: `prisma.order.findUnique` dengan include `items`, `items.product`, `shippingZone`
- Return 404 jika order tidak ditemukan
- Layout thermal 80mm via CSS `@media print`
- Konten struk:
  - Header: nama toko (dari SiteSetting), tanggal cetak
  - Kode order + status
  - Nama customer, nomor HP, alamat lengkap (kecamatan, kota, provinsi)
  - Tabel items: nama produk, aksesori snapshot, qty × harga
  - Subtotal, ongkir, diskon (jika ada), **TOTAL**
  - Instruksi pembayaran (jika status `PENDING_PAYMENT`) atau info "Menunggu Verifikasi" (jika `AWAITING_VERIFICATION`)
  - Footer: terima kasih + URL toko
- Embed `<AutoPrint />` client component untuk trigger `window.print()`
- Tombol "Tutup" (hanya tampil di screen, hidden saat print)

### 2. `src/components/admin/auto-print.tsx` — **BUAT BARU**

```tsx
"use client";
import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Delay sedikit agar halaman fully rendered sebelum print
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
```

### 3. `src/components/admin/notification-dropdown.tsx` — **EDIT**

Pada handler `parsed.type === "notification"`:
- Tambah kondisi: jika `data.type === "NEW_ORDER" || data.type === "PAYMENT_PROOF_UPLOADED"`
- Fetch setting `AUTO_PRINT_RECEIPT` (bisa disimpan di `localStorage` yang di-sync dari settings page, atau fetch `/api/settings` sekali saat mount)
- Jika aktif: `window.open('/admin/orders/${data.orderId}/print', '_blank', 'popup,width=420,height=900')`
- Jika popup diblok: tampilkan toast dengan tombol print manual sebagai fallback

### 4. `src/lib/validations/settings.ts` — **EDIT**

Tambahkan key baru ke `SETTING_KEYS`:

```ts
export const SETTING_KEYS = [
  // ... existing keys ...
  "AUTO_PRINT_RECEIPT", // "true" | "false"
] as const;
```

### 5. `src/components/admin/settings/settings-form.tsx` (atau file yang relevan) — **EDIT**

Tambah UI toggle:
- Label: "Cetak Struk Otomatis"
- Deskripsi: "Buka jendela print otomatis saat ada pesanan baru atau bukti pembayaran masuk. Pastikan popup diizinkan di browser."
- Komponen: `<Switch>` dari shadcn/ui
- Nilai disimpan ke SiteSetting dengan key `AUTO_PRINT_RECEIPT`

### 6. `src/app/api/admin/settings/route.ts` — **CEK**

Verifikasi bahwa key `AUTO_PRINT_RECEIPT` langsung dihandle tanpa perlu perubahan (kemungkinan sudah generik).

---

## CSS Layout Thermal (80mm)

```css
@media print {
  @page {
    width: 80mm;
    margin: 4mm;
  }
  body {
    font-family: monospace;
    font-size: 10pt;
    width: 72mm;
  }
  .no-print {
    display: none !important;
  }
}
```

---

## Pertimbangan & Risiko

| Hal | Detail |
|-----|--------|
| **Popup blocker** | Browser modern blok popup yang tidak dipicu user click. Admin perlu izinkan popup sekali di browser settings. Fallback: toast dengan tombol print manual. |
| **Multi-tab admin** | Jika admin buka dashboard di 2 tab, SSE terhubung 2x → popup print bisa muncul 2x. Solusi: cek `document.visibilityState === "visible"` sebelum open popup. |
| **Server restart** | SSE in-memory connection putus saat server restart (sudah ada reconnect logic di `NotificationDropdown`). Tidak ada dampak khusus untuk fitur ini. |
| **Print without dialog** | Tidak bisa bypass print dialog dari web tanpa ekstensi browser atau kiosk mode. Admin bisa set default printer ke thermal di OS agar lebih cepat. |
| **orderId vs orderCode** | SSE sudah broadcast `orderId` (UUID) — cukup untuk URL `/admin/orders/[id]/print`. Tidak perlu fetch tambahan. |

---

## Urutan Implementasi

- [ ] 1. Tambah `AUTO_PRINT_RECEIPT` ke `SETTING_KEYS` (`settings.ts`)
- [ ] 2. Buat `AutoPrint` client component (`auto-print.tsx`)
- [ ] 3. Buat halaman print (`/admin/orders/[id]/print/page.tsx`)
- [ ] 4. Tambah toggle di settings UI
- [ ] 5. Edit `NotificationDropdown` — tambah auto-print trigger + fallback toast
- [ ] 6. Cek settings API route
- [ ] 7. Test end-to-end: order baru → popup print muncul → layout 80mm OK
