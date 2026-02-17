import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D`TEMAN YOGA — Boneka Rajut Yoga Premium",
    short_name: "dTeman Yoga",
    description:
      "Temukan boneka rajut yoga premium handmade oleh pengrajin lokal Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1ed",
    theme_color: "#c85a2d",
    icons: [
      {
        src: "/images/brand-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
