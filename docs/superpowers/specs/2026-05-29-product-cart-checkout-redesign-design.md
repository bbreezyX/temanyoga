# Redesign Layout: Detail Produk, Keranjang, Checkout — Soft Card System

**Tanggal:** 2026-05-29
**Status:** Disetujui (siap masuk tahap rencana implementasi)
**Brand:** D`TEMAN YOGA — boneka rajut handmade

## Ringkasan

Merombak layout/UX tiga halaman customer — **Detail Produk**, **Keranjang**, dan **Checkout/Billing** — menjadi lebih modern, bersih, dan well-organized, tanpa mengubah identitas warna brand (terracotta hangat). Setelah implementasi, `DESIGN.md` ditulis ulang untuk mendokumentasikan sistem desain baru ini (menggantikan referensi gaya Ko-fi yang lama).

## Keputusan yang sudah disepakati

1. **Arah:** Pertahankan palet brand terracotta/krem yang ada. Rombak struktur/tata letak. `DESIGN.md` ditulis ulang **setelah** implementasi untuk mendokumentasikan desain baru.
2. **Masalah yang dibereskan:** (a) terlalu ramai / kurang fokus, (b) spacing & ritme tidak konsisten, (c) checkout terasa panjang/menakutkan, (d) mobile kurang nyaman.
3. **Struktur checkout:** Tetap **satu halaman**, dipecah jadi **kartu-kartu section** + progress indikator yang benar-benar mencerminkan kemajuan + sticky summary & sticky CTA mobile. (Bukan wizard multi-langkah.)
4. **Bahasa visual:** **Soft Card System** — tiap kelompok info dalam kartu rounded konsisten di atas kanvas hangat.

## Non-Goals (di luar lingkup)

- Tidak mengganti palet ke gaya Ko-fi biru.
- Tidak mengubah logika bisnis: cart context, perhitungan ongkir (SWR `/api/shipping-cost`), validasi kupon, pembuatan order, skema Zod, alur sukses/track-order tetap sama.
- Tidak menambah langkah/halaman baru pada alur checkout.
- Tidak merombak halaman lain (beranda, daftar produk, sukses, track-order) — kecuali penyesuaian token global yang merembet (lihat risiko).

## Fondasi — Soft Card Design System

### 1. Standardisasi warna

| Peran | Nilai | Catatan |
|---|---|---|
| Heading / display / dark CTA | `#2d241c` | Saat ini campur dengan `#3f3328`; disatukan untuk heading & dark surface |
| Teks tubuh kuat | `#3f3328` | `--foreground` |
| Teks sekunder | `#6b5b4b` | `--color-warm-gray` |
| Muted / placeholder | `#9a8772` | |
| Aksen utama / CTA | `#c85a2d` | `--color-terracotta` / `--primary` |
| Sukses / aksesoris | `#7a9d7f` | `--color-sage` |
| Border | `#e8dcc8` (umumnya `/60`) | `--color-warm-sand` |
| Surface paper | `#ffffff` | kartu utama |
| Surface muted | `#f9f9f9` | input, kartu sekunder, stepper |
| Cream | `#f5f1ed` | placeholder gambar |
| Tint terpilih | `#fdf8f6` | state selected (kurir, dll.) |

Aturan: heading & dark surface (dark CTA, blok total) pakai `#2d241c` secara konsisten; berhenti memakai `#3f3328` untuk heading.

### 2. Primitif Kartu

- **Card (default):** surface paper/muted + border `1px #e8dcc8/60` + radius **32px** + padding **24px (mobile) / 32px (desktop)** + opsional `shadow-soft`.
- **Card-lg (hero/ringkasan):** radius **40px**.
- **Gambar:** radius **40px**.

### 3. Set radius terbatas

`pill 9999px` · `input 16px (rounded-2xl)` · `kontrol kecil 12px` · `card 32px` · `card-lg & gambar 40px`. Hentikan radius acak (28/56/60) yang dipakai ad-hoc.

### 4. Ritme spacing seragam

- Gap antar-section: **64px desktop / 48px mobile**.
- Gap elemen dalam kartu: **20–24px**.
- Max-width konten: `1280px` (`max-w-7xl`).
- Padding tepi halaman: **24px mobile / 48px desktop** (`px-6 md:px-12`).
- Padding atas halaman seragam (hentikan campuran `pt-8`/`pt-12`/`pt-16`/`pt-20`).

### 5. Pola header section

Eyebrow terracotta (garis `h-px w-8` + label uppercase 11px, tracking lebar) → judul display (`font-display`, black). Identik di ketiga halaman.

### 6. Bahasa tombol

- **Primary CTA:** background terracotta `#c85a2d`, teks putih, hover → `#2d241c`, bentuk pill, min-height 56–64px, `shadow-lift`. Dipakai sebagai aksi utama di tiap halaman (Tambah ke Keranjang, Lanjut ke Pembayaran, Pesan).
- **Secondary:** surface muted + border sand, teks ink, pill — untuk aksi sekunder/quantity wrapper.
- Hentikan inkonsistensi arah hover (sekarang ada dark→terracotta dan terracotta→dark dicampur).

### 7. Perbaikan teknis

- Definisikan token **`--shadow-lift-sm`** di `globals.css` (saat ini class `shadow-lift-sm` dipakai di `product-detail.tsx` tetapi token-nya tidak ada → tidak ada efek). Nilai: bayangan halus di antara `shadow-soft` dan tanpa-bayangan.
- Tetap hormati `prefers-reduced-motion` (sudah ada) untuk animasi `floatIn` dan sticky bar.
- Sticky bottom bar mobile menghormati safe-area (`env(safe-area-inset-bottom)`).

## Layout per Halaman

### A. Detail Produk — `src/components/product/product-detail.tsx`

Grid 7/5 (desktop), satu kolom (mobile).

- **Breadcrumb** seragam di atas.
- **Kiri (sticky):** kartu gambar utama (radius 40px) + badge ulasan disederhanakan (anchor di gambar) + strip thumbnail rounded.
- **Kanan — tiga blok berirama:**
  1. **Blok judul:** eyebrow "100% Cotton Milk" → judul (`font-display`) → harga; harga lama tampil ber-coret saat aksesoris menambah harga.
  2. **Deskripsi:** paragraf bersih, dipisah spacing (bukan border berat).
  3. **Buy Box (kartu utama):** satu kartu berisi berurutan → selektor aksesoris → stepper jumlah → strip ringkas "Made to Order ±3 minggu" → tombol primary "Tambah ke Keranjang" / "Simpan Perubahan" (mode edit). Menggabungkan kontrol yang tadinya berserakan ke satu wadah aksi beli.
- **Benefit** (Pengiriman Aman / Garansi Retur): baris 2-kolom tipis di bawah buy box (bukan grid berat).
- **Mobile:** sticky bottom bar = harga + tombol Tambah ke Keranjang. Sembunyikan saat buy box utama sedang terlihat (opsional, kalau murah; minimal selalu tampil).
- **Ulasan:** section di bawah dengan header seragam (logika `ProductReviews` tidak berubah).

Catatan: mode edit (`?item=<cartLineId>`) tetap berfungsi — tombol berubah jadi "Simpan Perubahan" dan redirect ke `/cart`.

### B. Keranjang — `src/app/(customer)/cart/page.tsx` + `cart-item-row.tsx` + `cart-summary.tsx`

Grid 7/5 (desktop).

- **Header** seragam (eyebrow "Pilihan Anda" + judul "Keranjang Belanja" + link "Kembali Berbelanja").
- **Kiri — daftar item:** tiap item jadi **kartu lembut tersendiri** (`cart-item-row.tsx` diubah dari baris ber-garis menjadi kartu). Isi: gambar (radius), nama (link ke produk), chip aksesoris (sage) / "Tanpa aksesoris", link Edit, tombol Hapus, stepper jumlah, harga unit + subtotal item.
- **Kanan (sticky desktop):** kartu **Ringkasan** (`cart-summary.tsx`) — jumlah item, subtotal, ongkir ("Dihitung saat checkout"), total, CTA pill "Lanjut ke Pembayaran", catatan kecil.
- **Mobile:** sticky bottom bar = total + "Lanjut ke Pembayaran".
- **Empty state & loading state** dipertahankan, diselaraskan ke sistem baru.

### C. Checkout / Billing — `src/app/(customer)/checkout/checkout-client.tsx` + `address-fields.tsx`

Grid 7/5 (desktop), satu halaman.

- **Header:** link "Kembali Berbelanja" + eyebrow + judul "Informasi Pengiriman".
- **Progress indikator nyata** (mengganti bar dekoratif): tiga segmen —
  - *Penerima* ✓ saat `customerName`, `customerEmail`, `customerPhone` valid **dan** alamat lengkap (sampai `village`).
  - *Pengiriman* ✓ saat kurir terpilih (`hasShippingSelection`).
  - *Selesai* aktif saat submit.
  Derivasi state dari nilai form + `addressData` + `selectedCourierCode` yang sudah ada (read-only indikator; tidak memblokir input).
- **Form = tumpukan kartu section** (tiap kartu: badge nomor terracotta + judul):
  1. **Informasi Penerima** — nama, email, WhatsApp.
  2. **Alamat Pengiriman** — `AddressFields` (logika wilayah tidak berubah, hanya restyle agar selaras).
  3. **Pilih Pengiriman** — daftar kurir + semua state yang ada (menunggu alamat, loading, kurir tak tersedia, layanan bermasalah, error) di-restyle jadi kartu konsisten.
  4. **Kupon** — input + tombol "Gunakan" / kartu kupon terpasang + state error.
  5. **Catatan (opsional)** — textarea.
- **Kanan (sticky desktop): Ringkasan Pesanan** — mini-list item (gambar, qty badge, aksesoris, harga) + subtotal + diskon (jika ada) + ongkir + **blok total gelap `#2d241c`**, dan **tombol submit "Pesan" diletakkan di sini** (bukan terkubur di bawah form). Di bawahnya kartu trust ringkas (Produksi ±3 minggu, Jaminan Transaksi) versi lebih tipis.
- **Mobile:** sticky bottom bar = total + tombol "Pesan" (men-trigger submit form yang sama). Ringkasan bisa diakses di atas/inline.
- **Validasi & submit:** `react-hook-form` + Zod (`checkoutFormSchema`, `addressSchema`), toast error, payload order, redirect ke `/checkout/success/<orderCode>` — semua tidak berubah. Submit di summary/sticky bar memicu submit `<form>` yang sama (mis. via `form` attribute atau ref).

## Berkas yang terdampak

| Berkas | Perubahan |
|---|---|
| `src/app/globals.css` | Tambah `--shadow-lift-sm`; rapikan/komentari token warna; (opsional) util `.card` kalau membantu konsistensi. |
| `src/components/product/product-detail.tsx` | Restrukturisasi kolom kanan jadi buy box; sticky bar mobile; benefit row; header seragam. |
| `src/components/product/accessories-selector.tsx` | Restyle agar pas di dalam buy box (logika tetap). Verifikasi dulu isinya. |
| `src/components/product/image-gallery.tsx` | Verifikasi apakah dipakai detail page; selaraskan bila perlu. |
| `src/app/(customer)/products/[slug]/loading.tsx` | Selaraskan skeleton dengan layout baru (opsional tapi disarankan). |
| `src/app/(customer)/cart/page.tsx` | Restrukturisasi; sticky bar mobile; empty/loading selaras. |
| `src/components/cart/cart-item-row.tsx` | Baris → kartu lembut. |
| `src/components/cart/cart-summary.tsx` | Poles ke sistem baru. |
| `src/app/(customer)/checkout/checkout-client.tsx` | Section jadi kartu; progress nyata; submit di summary; sticky bar mobile. |
| `src/components/checkout/address-fields.tsx` | Restyle selaras (logika tetap). |
| `DESIGN.md` | **Tulis ulang penuh** mendokumentasikan Soft Card System (terracotta), menggantikan referensi Ko-fi. |

## Rencana penulisan ulang DESIGN.md

Setelah ketiga halaman jadi, `DESIGN.md` ditulis ulang dengan struktur: ringkasan brand → token warna (tabel di atas) → tipografi (Archivo display + DM Sans) → spacing & radius set → primitif kartu & komponen (buy box, kartu item, kartu section, ringkasan, tombol, input, kurir, badge progress) → pola header section → bahasa tombol → do's & don'ts → contoh prompt komponen. Diambil dari implementasi nyata supaya akurat (bukan aspirasional).

## Kriteria sukses

- Ketiga halaman memakai primitif kartu, set radius, dan ritme spacing yang sama.
- Hanya ada satu bahasa tombol primary (terracotta → hover dark) di seluruh alur.
- Tidak ada `#3f3328` dipakai sebagai warna heading; heading konsisten `#2d241c`.
- Checkout terasa lebih ringan: section terkelompok dalam kartu, progress mencerminkan kemajuan nyata, submit mudah dijangkau.
- Mobile: ada sticky bottom CTA di detail produk, keranjang, dan checkout; menghormati safe-area.
- Semua logika (cart, ongkir, kupon, order, edit item) tetap berfungsi seperti sebelumnya.
- `token shadow-lift-sm` terdefinisi & berefek.

## Verifikasi

- `npm run build` / typecheck lulus.
- Uji manual alur: tambah ke keranjang (baru & edit item) → keranjang → checkout (isi alamat → ongkir muncul → pilih kurir → kupon → submit → halaman sukses).
- Cek state error checkout: alamat belum lengkap, kurir tak tersedia, layanan ongkir gangguan, kupon salah.
- Cek responsif: mobile (sticky bar, urutan elemen), tablet, desktop (sticky summary).
- Cek `prefers-reduced-motion`.

## Risiko

- Token warna global (`globals.css`) dipakai juga halaman lain → perubahan dijaga aditif (mis. hanya menambah `--shadow-lift-sm`, tidak mengubah nilai token yang sudah dipakai luas) agar tidak merembet ke beranda/daftar produk.
- `accessories-selector.tsx` dan `image-gallery.tsx` perlu dibaca dulu sebelum diubah (belum diperiksa di sesi ini).
