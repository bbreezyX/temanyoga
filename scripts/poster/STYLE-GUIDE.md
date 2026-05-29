# Teman Yoga — Poster Design System

Sistem desain **umum** untuk semua poster (bukan cuma katalog). Bahasa visual aktif:
**Retro Print / Riso · Earth Tone**. Katalog hanya **satu contoh** penerapannya
(lihat Bagian 7).

Token desain hidup di **`lib/theme.ts`** — import dari sana di template poster apa pun
biar tetap on-brand.

---

## 1. Design tokens — `lib/theme.ts`

### Palet (`palette`)

| Token   | Hex       | Peran                              |
| ------- | --------- | ---------------------------------- |
| `paper` | `#EEE3CB` | Latar kertas (oatmeal)             |
| `clay`  | `#B0572F` | Tinta 1 — terracotta/rust          |
| `moss`  | `#5C6A45` | Tinta 2 — olive green              |
| `cream` | `#F4ECD8` | Teks/elemen di atas blok warna     |
| `ink`   | `#473225` | Teks isi + keyline (cokelat tua)   |

Aturan: maksimal **2 tinta + kertas + 1 warna teks** biar tetap "riso". Ganti seluruh
look cukup ubah `palette` di satu file.

### Tipografi (`fonts`)

| Token     | Family             | Untuk                                  |
| --------- | ------------------ | -------------------------------------- |
| `display` | Anton (+ Archivo)  | Judul/headline besar — UPPERCASE padat |
| `body`    | Archivo            | Subjudul, body, label, tag             |

Font di-load di `lib/document.tsx` (cetak) & `src/app/poster/page.tsx` (web). Kalau
nambah font, update keduanya.

---

## 2. Bahasa visual riso (signature)

Teknik-teknik ini yang bikin gayanya — pakai sebagian/semua di poster apa pun:

- **Overprint** — teks/elemen ditumpuk duplikatnya yang di-offset + `mixBlendMode: "multiply"` → kesan salah-register cetak.
- **Blok offset registrasi** — blok warna solid di belakang foto/elemen, di-offset ~1.8mm.
- **Halftone** — overlay titik: `radial-gradient(<warna> 26%, transparent 28%)` + `backgroundSize` kecil.
- **Grain** — `GRAIN` dari theme, dipasang sebagai overlay `multiply` opacity rendah.
- **Crop marks** — tanda potong di 4 sudut (ala cetak).
- **Blok warna, bukan garis** — area penting pakai blok solid `clay`/`moss` full-bleed; teks di atasnya `cream`.
- **Aksen selang-seling** — elemen berurut pakai `clay`/`moss` bergantian (`i % 2`).

---

## 3. Sizing & layout

- Semua ukuran pakai helper lokal `mm(n)` = `` `${n * k}mm` `` dengan `k = dims.full.w / 303`.
  Jangan pakai `px` keras → proporsi konsisten di A3 & A2.
- Margin aman teks: **~13mm** dari tepi (taruh teks di dalam area aman).
- Blok warna boleh **full-bleed** ke tepi; teks tetap di area aman.

---

## 4. Cetak

- Ukuran via field `size`: **A3** (297×420mm) atau **A2** (420×594mm), `orientation` portrait/landscape.
- **Bleed 3mm** ditambah otomatis di jalur kode (`poster:generate`). Jalur web mencetak ukuran trim.
- Teks = **vektor** (tajam di ukuran berapa pun). Foto = raster → siapkan ~300 DPI (A3 ~1600px/sel, A2 ~2300px).
- Output **RGB** (Chromium tak bisa CMYK). Mau CMYK → konversi Ghostscript (lihat `README.md`).

---

## 5. Infra bersama (dipakai semua template)

| File                | Fungsi                                                            |
| ------------------- | ----------------------------------------------------------------- |
| `lib/theme.ts`      | Token desain (palette, fonts, GRAIN)                              |
| `lib/sizes.ts`      | `getDimensions(size, orientation)` → trim, full, bleed, DPI       |
| `lib/document.tsx`  | `buildHtml(el, dims)` (bungkus + `@page` + font) · `resolveImage` |
| `generate.tsx`      | Runner → PDF cetak (A3/A2 + bleed) ke `out/`                       |
| `preview.tsx`       | Runner → PNG cepat ke `out/`                                       |
| `src/app/poster/page.tsx` | Editor web (form + live preview + Cetak/Simpan PDF)         |

### Kontrak props template (umum)

Tiap template poster menerima:

```ts
{
  data,        // objek konten (bentuknya bebas per template)
  dims,        // hasil getDimensions(...)
  photos,      // Record<string, string | null> — peta gambar (key = item.photo)
  logo,        // string | null (data URL / hasil resolveImage)
  editable?,   // true di editor web (mis. tampilkan handle resize logo)
}
```

---

## 6. Bikin poster baru

### Jalur web (1 poster, paling cepat)

```bash
npm run dev      # http://localhost:3000/poster
```

Isi form → upload foto/logo → atur logo (seret/handle/slider) → **Cetak / Simpan PDF**
(paper A3, margins None, Background graphics on). Auto-save ke browser.

### Jalur kode (batch / bleed-ready)

Taruh foto di `assets/`, isi data, lalu:

```bash
npm run poster:preview     # PNG cek layout
npm run poster:generate    # PDF cetak
```

### Template gaya/jenis baru (bukan katalog)

1. Buat `templates/<Nama>.tsx`. Import token: `import { palette, fonts, GRAIN } from "../lib/theme"`.
2. Pakai `dims` + helper `mm(n)` (skala `k`) untuk semua ukuran.
3. Terapkan teknik riso (Bagian 2) sesuai kebutuhan poster.
4. (Opsional) dukung logo overlay + `editable` kalau mau bisa diedit di web.
5. Daftarkan: ganti import template di `generate.tsx`, `preview.tsx`, dan `src/app/poster/page.tsx`
   (pola yang sama dipakai saat pindah PromoPoster → CatalogPoster → EventCatalogPoster).

Data: definisikan bentuk data sendiri (atau pakai `EventCatalogData`). Yang penting kontrak
props di atas tetap dipatuhi supaya editor web & pipeline kompatibel.

---

## 7. Contoh implementasi — Katalog

Template `templates/EventCatalogPoster.tsx`, data `EventCatalogData` (`lib/types.ts`).

**Anatomi:** masthead (blok `moss`) → judul overprint → tagline → intro → grid 4×2
(foto + nama + tag) → footer 2 blok (`moss` Detail + `clay` Inspirasi). Crop marks + logo overlay.

**Field `EventCatalogData`:** `size`, `orientation`, `heading`, `items[{photo,name,tag}]` (wajib);
`columns`, `subtitle`, `tagline`, `intro`, `details[{label,value}]`, `detailTitle`,
`inspiration`, `inspirationTitle`, `logo`, `logoPos`, `logoSize` (opsional).
> `brandTag` masih ada di tipe tapi tidak dipakai template ini.

---

## 8. Checklist poster baru

- [ ] Token dari `lib/theme.ts` (jangan hardcode warna/font)
- [ ] Ukuran via `mm(n)`/`k`, teks di area aman
- [ ] Aset (foto/logo) resolusi cukup untuk cetak
- [ ] Cek `poster:preview` atau preview web
- [ ] Export PDF A3/A2 → cek bleed & warna sebelum ke percetakan
