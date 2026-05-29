/**
 * Teman Yoga — poster design system.
 *
 * Shared visual tokens for ANY poster template (not catalog-specific).
 * Import these in a new template to stay on-brand. Current visual language:
 * "Retro Print / Riso · Earth Tone".
 */

/**
 * Riso earth-tone palette. Keep to at most 2 inks + paper + one text color so
 * posters retain the limited-ink "riso" feel.
 */
export const palette = {
  paper: "#EEE3CB", // oatmeal — page background
  clay: "#B0572F", // terracotta / rust — ink 1
  moss: "#5C6A45", // deep olive green — ink 2
  cream: "#F4ECD8", // text / marks on top of ink blocks
  ink: "#473225", // body text + keylines — deep warm brown
} as const;

/** Font families. Loaded by lib/document.tsx (print) and the web editor. */
export const fonts = {
  display: '"Anton", "Archivo", sans-serif', // big condensed UPPERCASE
  body: '"Archivo", system-ui, sans-serif', // everything else
} as const;

/** Subtle paper grain (feTurbulence). Layer as an overlay with multiply + low opacity. */
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";
