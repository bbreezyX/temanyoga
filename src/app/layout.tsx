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

export const metadata: Metadata = {
  title: {
    default: "D`TEMAN YOGA — Menemani Perjalanan Yoga Anda",
    template: "%s | D`TEMAN YOGA",
  },
  description:
    "Temukan boneka rajut yoga premium dari D`TEMAN YOGA. Simbol kedamaian, kesadaran, dan teman setia dalam setiap asana Anda.",
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