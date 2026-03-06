import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { UlasClient } from "./ulas-client";

export const metadata: Metadata = {
  title: "Beri Ulasan | D'TEMAN YOGA",
  description:
    "Beri ulasan untuk boneka rajut yoga pesanan Anda. Masukkan kode order dan bagikan pengalaman Anda.",
  alternates: {
    canonical: `${SITE_URL}/ulas`,
  },
  openGraph: {
    url: `${SITE_URL}/ulas`,
    title: "Beri Ulasan | D'TEMAN YOGA",
    description:
      "Beri ulasan untuk boneka rajut yoga pesanan Anda. Masukkan kode order dan bagikan pengalaman Anda.",
  },
};

export default function UlasPage() {
  return <UlasClient />;
}
