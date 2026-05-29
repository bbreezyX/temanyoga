import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Dimensions } from "./sizes";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(HERE, "..", "assets");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Resolve an asset filename to a base64 data URI so it embeds directly in the
 * HTML (no file:// or network resolution needed). Returns null if missing or
 * unsupported — the template then renders a placeholder.
 */
export function resolveImage(name?: string): string | null {
  if (!name) return null;
  const file = path.isAbsolute(name) ? name : path.join(ASSETS_DIR, name);
  if (!existsSync(file)) {
    console.warn(`  ! image not found: ${name} — using placeholder`);
    return null;
  }
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) {
    console.warn(`  ! unsupported image type for ${name} — using placeholder`);
    return null;
  }
  return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
}

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600" +
  "&family=Playfair+Display:wght@600;700;800" +
  "&family=Baloo+2:wght@500;700;800" +
  "&family=Caveat:wght@500;700" +
  "&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700" +
  "&family=Anton" +
  "&family=Archivo:wght@400;500;600;700;800&display=swap";

/** Wrap a rendered poster element in a print-ready HTML document. */
export function buildHtml(element: ReactElement, dims: Dimensions): string {
  const markup = renderToStaticMarkup(element);
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${FONTS_HREF}" />
<style>
  @page { size: ${dims.full.w}mm ${dims.full.h}mm; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Inter", system-ui, sans-serif; }
</style>
</head>
<body>${markup}</body>
</html>`;
}
