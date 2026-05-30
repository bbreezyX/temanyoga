import Link from "next/link";

export default function AdminOrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-ink/60 font-medium">Pesanan tidak ditemukan</p>
      <Link
        href="/admin/orders"
        className="mt-4 text-action border border-action/20 rounded-full px-6 py-2 hover:bg-action/5 transition-all text-sm font-bold"
      >
        Kembali ke Pesanan
      </Link>
    </div>
  );
}
