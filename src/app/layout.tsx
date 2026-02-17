import type { Metadata } from "next";
import { Manrope, Archivo } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/contexts/cart-context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const SITE_URL = "https://ditemaniyoga.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "D`TEMAN YOGA — Menemani Perjalanan Yoga Anda",
    template: "%s | D`TEMAN YOGA",
  },
  description:
    "Temukan boneka rajut yoga premium dari D`TEMAN YOGA. Simbol kedamaian, kesadaran, dan teman setia dalam setiap asana Anda. Handmade dengan cinta oleh pengrajin lokal Indonesia.",
  keywords: [
    "boneka rajut yoga",
    "yoga keychain",
    "handmade crochet",
    "boneka handmade Indonesia",
    "aksesori yoga",
    "yoga companion",
    "rajut benang katun",
    "gift yoga lover",
    "kado unik yoga",
  ],
  authors: [{ name: "D`TEMAN YOGA" }],
  creator: "D`TEMAN YOGA",
  publisher: "D`TEMAN YOGA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "D`TEMAN YOGA",
    title: "D`TEMAN YOGA — Menemani Perjalanan Yoga Anda",
    description:
      "Temukan boneka rajut yoga premium dari D`TEMAN YOGA. Simbol kedamaian, kesadaran, dan teman setia dalam setiap asana Anda.",
  },
  twitter: {
    card: "summary_large_image",
    title: "D`TEMAN YOGA — Menemani Perjalanan Yoga Anda",
    description:
      "Temukan boneka rajut yoga premium dari D`TEMAN YOGA. Simbol kedamaian, kesadaran, dan teman setia dalam setiap asana Anda.",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/brand-logo.png",
    apple: "/images/brand-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${manrope.variable} ${archivo.variable} antialiased font-sans`}
      >
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
