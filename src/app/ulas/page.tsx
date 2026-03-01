import type { Metadata } from "next";
import { UlasClient } from "./ulas-client";

export const metadata: Metadata = {
  title: "Beri Ulasan | D'TEMAN YOGA",
  description:
    "Beri ulasan untuk boneka rajut yoga pesanan Anda. Masukkan kode order dan bagikan pengalaman Anda.",
  alternates: {
    canonical: "https://ditemaniyoga.com/ulas",
  },
};

export default function UlasPage() {
  return <UlasClient />;
}
