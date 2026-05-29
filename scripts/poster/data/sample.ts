import type { PosterData } from "../lib/types";

/**
 * Each entry produces one PDF. Add objects here (or generate this array from
 * your DB / a CMS) to batch-produce posters. `background` points at a file in
 * `scripts/poster/assets/`; if it's missing the template uses a gradient.
 */
export const posters: PosterData[] = [
  {
    slug: "kelas-vinyasa-pagi",
    size: "A3",
    orientation: "portrait",
    background: "vinyasa-pagi.jpg",
    eyebrow: "Kelas Yoga Mingguan",
    title: "Vinyasa Flow Pagi",
    subtitle:
      "Mulai harimu dengan napas, gerak, dan ketenangan bersama Teman Yoga.",
    details: [
      { label: "Jadwal", value: "Sabtu · 07.00 WIB" },
      { label: "Lokasi", value: "Studio Teman Yoga, Jakarta" },
      { label: "Level", value: "Pemula – Menengah" },
    ],
    cta: "Daftar Sekarang",
    footer: "@temanyoga · temanyoga.com",
    accent: "#E08D5A",
  },
  {
    slug: "retreat-akhir-pekan",
    size: "A2",
    orientation: "portrait",
    background: "retreat.jpg",
    eyebrow: "Weekend Retreat",
    title: "Retret Yoga & Meditasi",
    subtitle: "Dua hari melepas penat di tengah alam.",
    details: [
      { label: "Tanggal", value: "21–22 Juni 2026" },
      { label: "Lokasi", value: "Bogor, Jawa Barat" },
    ],
    cta: "Slot Terbatas",
    footer: "@temanyoga",
    accent: "#8FA37E",
  },
];
