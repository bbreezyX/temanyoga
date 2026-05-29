import type { Orientation, PaperSize } from "./types";

/** Trim sizes in millimetres (portrait). */
const PAPER_MM: Record<PaperSize, { w: number; h: number }> = {
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
};

/** Bleed added on every side (printer trims into this). */
export const BLEED_MM = 3;
/** Keep text/logos at least this far inside the trim edge. */
export const SAFE_MM = 12;

const MM_PER_INCH = 25.4;
const toPx = (mm: number, dpi = 300) => Math.round((mm / MM_PER_INCH) * dpi);

export interface Dimensions {
  /** Final cut size. */
  trim: { w: number; h: number };
  /** Trim + bleed on all sides — this is the actual page size. */
  full: { w: number; h: number };
  bleed: number;
  safe: number;
  /** Distance from the full (bled) edge to the safe content area = bleed + safe. */
  contentInset: number;
  /** Pixel size of the full canvas at 300 DPI — the min resolution your AI art needs. */
  px300: { w: number; h: number };
}

export function getDimensions(
  size: PaperSize,
  orientation: Orientation,
): Dimensions {
  const base = PAPER_MM[size];
  const trim =
    orientation === "portrait" ? { ...base } : { w: base.h, h: base.w };
  const full = { w: trim.w + BLEED_MM * 2, h: trim.h + BLEED_MM * 2 };
  return {
    trim,
    full,
    bleed: BLEED_MM,
    safe: SAFE_MM,
    contentInset: BLEED_MM + SAFE_MM,
    px300: { w: toPx(full.w), h: toPx(full.h) },
  };
}
