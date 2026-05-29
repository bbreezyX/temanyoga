export type PaperSize = "A3" | "A2";
export type Orientation = "portrait" | "landscape";

export interface PosterDetail {
  label: string;
  value: string;
}

export interface PosterData {
  /** Output filename (without extension). Falls back to a slug of `title`. */
  slug?: string;
  size: PaperSize;
  orientation: Orientation;
  /**
   * Filename inside `scripts/poster/assets/`, or an absolute path.
   * Optional — if missing/unreadable the template falls back to a gradient,
   * so the pipeline runs before you have any AI artwork.
   */
  background?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  details?: PosterDetail[];
  cta?: string;
  footer?: string;
  /** Accent color (hex). Defaults to a warm terracotta. */
  accent?: string;
}

export interface CatalogItem {
  /** Filename inside `scripts/poster/assets/` (use high-res originals). */
  photo: string;
  name: string;
  /** Price in rupiah (integer). Rendered as `Rp 150.000`. */
  price: number;
  /** 1–2 lines; clamped to 2 in the layout. */
  description?: string;
}

export interface CatalogData {
  /** Output filename (without extension). Falls back to a slug of `title`. */
  slug?: string;
  size: PaperSize;
  orientation: Orientation;
  /** Header title (brand name). */
  title: string;
  /** Header right-side label, e.g. "Katalog Produk · 2026". */
  subtitle?: string;
  /** Grid columns. Default 2. */
  columns?: number;
  /** Footer-left contact line. */
  footer?: string;
  /** Footer-right fine print, e.g. price disclaimer. */
  note?: string;
  /** Accent color (hex) for price + rules. Defaults to terracotta. */
  accent?: string;
  items: CatalogItem[];
}

export interface EventCatalogItem {
  /** Filename inside `scripts/poster/assets/`. */
  photo: string;
  /** Product name; wraps to 2 lines, centered. */
  name: string;
  /** Short descriptor shown in a pill, e.g. "Calm as night". */
  tag?: string;
}

export interface DetailLine {
  label: string;
  value: string;
}

/**
 * Warm "handmade" catalog styled for a table-top event poster: ornate frame,
 * puffy title, framed photos, plus Detail + Inspiration blocks.
 */
export interface EventCatalogData {
  slug?: string;
  size: PaperSize;
  orientation: Orientation;
  /** Grid columns. Default 4. */
  columns?: number;
  /** Optional logo image (filename in assets/) for the corner badge. */
  logo?: string;
  /** Small handle under/in the badge, e.g. "#temanyoga". */
  brandTag?: string;
  /** Badge center position as % of the poster (0–100). Default top-right. */
  logoPos?: { x: number; y: number };
  /** Badge diameter in mm. Default 30. */
  logoSize?: number;
  /** Big puffy title word, e.g. "CATALOG" / "KATALOG". */
  heading: string;
  /** Bold script line under the title. */
  subtitle?: string;
  /** Script affirmation line. */
  tagline?: string;
  /** Intro paragraph (centered). */
  intro?: string;
  items: EventCatalogItem[];
  detailTitle?: string;
  details?: DetailLine[];
  inspirationTitle?: string;
  inspiration?: string;
}
