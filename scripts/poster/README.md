# Poster

Print posters for Teman Yoga — make them in the **web editor** or via **code**.
Write a JSX template, feed it data, get a print-ready A3/A2 PDF (vector text +
embedded photos).

> **Design system & how to build new posters:** see **[STYLE-GUIDE.md](./STYLE-GUIDE.md)**
> (palette/typography tokens in `lib/theme.ts`, riso techniques, template recipe).
> This file is just the quick overview.

## Make a poster

**Web (easiest, one poster):**

```bash
npm run dev          # → http://localhost:3000/poster
```

Fill the form, upload photos/logo, position the logo, then **Cetak / Simpan PDF**
(paper A3, margins None, Background graphics on). Auto-saved in the browser.

**Code (batch / bleed-ready):** put photos in `assets/`, edit the data file, then:

```bash
npm run poster:preview     # PNG to out/ (quick layout check)
npm run poster:generate    # print PDF (A3/A2 + 3mm bleed) to out/
```

## Templates

| Template (`templates/`)   | Style                              | Data file              |
| ------------------------- | ---------------------------------- | ---------------------- |
| `EventCatalogPoster` ✅   | Riso earth-tone catalog (active)   | `data/event-catalog.ts`|
| `CatalogPoster`           | Minimal catalog w/ price           | `data/catalog.ts`      |
| `PromoPoster`             | Single hero (title over image)     | `data/sample.ts`       |

To switch the active template, change the import in `generate.tsx`, `preview.tsx`,
and `src/app/poster/page.tsx`.

## How it works

`template (JSX, mm-scaled)` → `lib/document.tsx` `buildHtml` (wraps in HTML with
`@page` size, loads fonts, embeds images as data URIs) → Puppeteer `page.pdf()`
(`preferCSSPageSize` + `printBackground`) → vector text + 3mm bleed.

Shared pieces: design tokens in `lib/theme.ts`, sizing/bleed/DPI in `lib/sizes.ts`.
Photo resolution guidance in `assets/README.md`.

## Color: RGB now, CMYK later

Chromium only emits **RGB** PDFs — it cannot produce CMYK. Most digital printers
accept RGB and convert. If your printer demands CMYK, add a post-step with
Ghostscript and an ICC profile:

```bash
gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
   -sProcessColorModel=DeviceCMYK -sColorConversionStrategy=CMYK \
   -dPDFSETTINGS=/prepress \
   -sOutputFile=out/poster-cmyk.pdf out/poster.pdf
```

(Not wired in — add only if a printer requires it.)
