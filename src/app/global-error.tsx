"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="bg-cream text-dark-brown antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 inline-flex rounded-full bg-terracotta/10 p-4">
              <AlertTriangle className="h-8 w-8 text-terracotta" />
            </div>
            
            <h1 className="mb-3 font-display text-2xl font-bold text-dark-brown">
              Terjadi Kesalahan
            </h1>
            
            <p className="mb-6 text-warm-gray">
              Maaf, terjadi kesalahan tak terduga. Tim kami telah diberitahu dan 
              sedang bekerja untuk memperbaikinya.
            </p>
            
            {error.digest && (
              <p className="mb-4 rounded-lg bg-warm-sand/50 px-3 py-2 font-mono text-xs text-warm-gray">
                Error ID: {error.digest}
              </p>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 font-medium text-white transition-all hover:bg-terracotta/90"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </button>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-warm-sand bg-white px-6 py-3 font-medium text-dark-brown transition-all hover:bg-warm-sand/30"
              >
                <Home className="h-4 w-4" />
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
