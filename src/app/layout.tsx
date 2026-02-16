import type { Metadata } from "next";
import { Manrope, Archivo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/cart-context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "dTeman Yoga — Menemani Perjalanan Yoga Anda",
    template: "%s | dTeman Yoga",
  },
  description:
    "Temukan boneka rajut yoga premium dari dTeman Yoga. Simbol kedamaian, kesadaran, dan teman setia dalam setiap asana Anda.",
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
        <CartProvider>{children}</CartProvider>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
