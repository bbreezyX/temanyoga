import Link from "next/link";

export function OrderNotFound() {
  return (
    <div className="-mt-20 flex min-h-screen flex-col items-center justify-center bg-canvas-oat px-6 text-center font-sans text-ink md:-mt-24">
      <h1 className="font-bungee text-[clamp(1.75rem,7vw,3rem)] leading-[1.05] text-ink">
        Pesanan Tidak Ditemukan
      </h1>
      <p className="mb-9 mt-5 max-w-sm text-ink-soft">
        Maaf, kami tidak dapat menemukan pesanan dengan kode tersebut. Silakan
        cek kembali kode pesanan Anda.
      </p>
      <Link
        href="/products"
        className="rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-action"
      >
        Kembali Berbelanja
      </Link>
    </div>
  );
}
