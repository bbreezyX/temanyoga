import Link from "next/link";
import { ArrowRight, Package, Truck } from "lucide-react";
import { InfoPageShell, InfoSection } from "@/components/info/info-page-shell";
import { createInfoPageMetadata } from "@/lib/info-page-metadata";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

// Shipping zones change rarely — ISR keeps navigation instant (served from cache,
// revalidated in the background) instead of a full SSR + DB roundtrip per visit.
export const revalidate = 600;

export const metadata = createInfoPageMetadata({
  path: "/shipping",
  title: "Pengiriman",
  description:
    "Informasi layanan pengiriman D'TEMAN YOGA: kurir yang tersedia, estimasi waktu, dan biaya ongkir.",
});

const COURIERS = [
  { name: "JNE", note: "Reguler & express sesuai ketersediaan di alamat tujuan" },
  { name: "J&T Express", note: "Pengiriman cepat ke seluruh Indonesia" },
  { name: "Lion Parcel", note: "Opsi ekonomis untuk paket ke berbagai kota" },
  { name: "AnterAja", note: "Alternatif pengiriman dengan estimasi waktu bervariasi" },
];

export default async function ShippingPage() {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      description: true,
      price: true,
    },
  });

  return (
    <InfoPageShell
      eyebrow="Bantuan"
      title="Informasi Pengiriman"
      description="Kami mengirim boneka rajut handmade dengan aman ke seluruh Indonesia. Ongkir dihitung otomatis saat checkout berdasarkan alamat tujuan Anda."
    >
      <InfoSection title="Cara Kerja Pengiriman">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Pilih produk dan lanjut ke halaman checkout.</li>
          <li>Isi alamat lengkap hingga tingkat kelurahan/desa.</li>
          <li>
            Sistem menampilkan opsi kurir beserta estimasi biaya pengiriman
            untuk alamat Anda.
          </li>
          <li>
            Setelah pembayaran diverifikasi, pesanan diproses dan dikirim dengan
            nomor resi yang bisa Anda lacak.
          </li>
        </ol>
        <Link
          href="/track-order"
          className="group mt-2 inline-flex items-center gap-2 font-semibold text-[#c85a2d] transition-colors hover:text-[#b14f27]"
        >
          Lacak pesanan
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </InfoSection>

      <InfoSection title="Kurir yang Didukung">
        <p>
          Saat checkout, ongkir dihitung melalui integrasi ekspedisi. Kurir
          yang tersedia bergantung pada alamat tujuan:
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {COURIERS.map((courier) => (
            <li
              key={courier.name}
              className="rounded-[20px] border border-[#eadfce] bg-[#fbf8f4] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                  <Truck className="h-5 w-5 text-[#c85a2d]" />
                </div>
                <div>
                  <p className="font-semibold text-[#2d241c]">{courier.name}</p>
                  <p className="mt-1 text-sm leading-6">{courier.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title="Estimasi Waktu">
        <div className="flex items-start gap-3 rounded-[20px] border border-[#eadfce] bg-[#fbf8f4] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
            <Package className="h-5 w-5 text-[#c85a2d]" />
          </div>
          <div>
            <p className="font-semibold text-[#2d241c]">Produk handmade</p>
            <p className="mt-1">
              Persiapan pesanan membutuhkan 1–3 hari kerja setelah pembayaran
              terverifikasi. Waktu transit kurir bervariasi menurut kota tujuan
              dan layanan yang dipilih.
            </p>
          </div>
        </div>
      </InfoSection>

      {zones.length > 0 ? (
        <InfoSection title="Zona Pengiriman">
          <p>
            Untuk beberapa alamat, biaya pengiriman juga dapat mengikuti zona
            berikut yang dikelola admin:
          </p>
          <ul className="divide-y divide-[#eadfce] overflow-hidden rounded-[20px] border border-[#eadfce]">
            {zones.map((zone) => (
              <li
                key={zone.name}
                className="flex flex-col gap-1 bg-[#fbf8f4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-[#2d241c]">{zone.name}</p>
                  {zone.description ? (
                    <p className="mt-1 text-sm">{zone.description}</p>
                  ) : null}
                </div>
                <p className="font-display text-lg font-semibold text-[#c85a2d]">
                  {formatCurrency(zone.price)}
                </p>
              </li>
            ))}
          </ul>
        </InfoSection>
      ) : null}

      <InfoSection title="Catatan Penting">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Pastikan alamat dan nomor telepon benar agar kurir dapat
            menghubungi penerima.
          </li>
          <li>
            Jika layanan ongkir otomatis belum tersedia untuk alamat Anda,
            tim kami akan membantu pengiriman manual.
          </li>
          <li>
            Nomor resi akan dikirim setelah pesanan berstatus{" "}
            <strong className="font-semibold text-[#2d241c]">Dikirim</strong>.
          </li>
        </ul>
      </InfoSection>
    </InfoPageShell>
  );
}
