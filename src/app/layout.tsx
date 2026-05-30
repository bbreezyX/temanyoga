import type { Metadata } from "next";
import { DM_Sans, Bungee, Fraunces } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { SITE_URL } from "@/lib/site-url";
import { getR2Origin } from "@/lib/image-url";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

// Editorial heading tier — variable weight + optical sizing (auto high-contrast at display sizes)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: true,
});

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
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const r2Origin = getR2Origin();

  return (
    <html lang="id">
      <head>
        {r2Origin ? (
          <>
            <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={r2Origin} />
          </>
        ) : null}
      </head>
      <body
        className={`${dmSans.variable} ${bungee.variable} ${fraunces.variable} antialiased font-sans`}
      >
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
