import type { CatalogData } from "../lib/types";

/**
 * One entry = one poster PDF. Put your item photos in `scripts/poster/assets/`
 * and reference the filename in `photo`. `price` is in rupiah (integer).
 * Missing photos render as a labelled placeholder, so you can lay out the grid
 * before all images are ready.
 */
export const catalogs: CatalogData[] = [
  {
    slug: "katalog-yoga-2026",
    size: "A3",
    orientation: "landscape",
    title: "Teman Yoga",
    subtitle: "Katalog Produk · 2026",
    columns: 4,
    accent: "#C2703D",
    footer: "@temanyoga · temanyoga.com",
    note: "*Harga dapat berubah sewaktu-waktu",
    items: [
      {
        photo: "yoga-mat.jpg",
        name: "Yoga Mat Premium",
        price: 285000,
        description: "Anti-slip TPE 6mm, ringan dan mudah digulung.",
      },
      {
        photo: "yoga-block.jpg",
        name: "Yoga Block (2 pcs)",
        price: 120000,
        description: "Busa EVA padat, menopang pose dengan stabil.",
      },
      {
        photo: "yoga-strap.jpg",
        name: "Yoga Strap",
        price: 65000,
        description: "Katun tebal 2,5m dengan gesper logam.",
      },
      {
        photo: "bolster.jpg",
        name: "Bolster Yoga",
        price: 240000,
        description: "Isi kapuk, ideal untuk restorative & yin yoga.",
      },
      {
        photo: "meditation-cushion.jpg",
        name: "Bantal Meditasi",
        price: 175000,
        description: "Dudukan empuk untuk sesi meditasi yang panjang.",
      },
      {
        photo: "yoga-wheel.jpg",
        name: "Yoga Wheel",
        price: 195000,
        description: "Bantu peregangan punggung & pembukaan dada.",
      },
      {
        photo: "yoga-towel.jpg",
        name: "Handuk Yoga",
        price: 95000,
        description: "Microfiber penyerap keringat, anti-slip di atas mat.",
      },
      {
        photo: "mat-bag.jpg",
        name: "Tas Mat Yoga",
        price: 110000,
        description: "Kanvas dengan tali bahu, muat mat + botol minum.",
      },
    ],
  },
];
