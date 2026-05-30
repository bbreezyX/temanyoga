import Link from "next/link";
import { InfoPageShell, InfoSection } from "@/components/info/info-page-shell";
import { createInfoPageMetadata } from "@/lib/info-page-metadata";

export const metadata = createInfoPageMetadata({
  path: "/terms",
  title: "Syarat Layanan",
  description:
    "Syarat dan ketentuan penggunaan layanan belanja online D'TEMAN YOGA.",
});

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Syarat Layanan"
      description="Dengan menggunakan situs dan layanan D'TEMAN YOGA, Anda setuju dengan syarat berikut."
    >
      <InfoSection title="Ketentuan Umum">
        <p>
          D'TEMAN YOGA menyediakan platform belanja online untuk produk handmade.
          Kami berhak memperbarui syarat layanan tanpa pemberitahuan sebelumnya.
          Versi terbaru selalu tersedia di halaman ini.
        </p>
      </InfoSection>

      <InfoSection title="Pemesanan dan Pembayaran">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Pesanan dianggap sah setelah Anda menerima kode pesanan dan
            menyelesaikan pembayaran sesuai instruksi.
          </li>
          <li>
            Harga, stok, dan ketersediaan produk dapat berubah sewaktu-waktu.
          </li>
          <li>
            Pembayaran diverifikasi manual; pesanan diproses setelah bukti
            transfer disetujui.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Pengiriman">
        <p>
          Estimasi waktu pengiriman bersifat indikatif. Keterlambatan akibat
          force majeure, cuaca, atau kendala pihak ekspedisi berada di luar
          kendali langsung kami, namun kami akan membantu menindaklanjuti
          sejauh memungkinkan.
        </p>
      </InfoSection>

      <InfoSection title="Produk Handmade">
        <p>
          Produk dibuat secara artisanal sehingga dapat terdapat variasi kecil
          pada warna, tekstur, atau detail. Variasi tersebut bukan cacat produk
          selama tidak memengaruhi fungsi dan kualitas utama.
        </p>
      </InfoSection>

      <InfoSection title="Pembatalan dan Pengembalian">
        <p>
          Pembatalan dapat diajukan sebelum pesanan diproses. Kebijakan
          pengembalian atau penukaran ditangani case-by-case; hubungi kami
          dengan kode pesanan dan alasan permintaan.
        </p>
      </InfoSection>

      <InfoSection title="Batas Tanggung Jawab">
        <p>
          Kami tidak bertanggung jawab atas kerugian tidak langsung akibat
          penggunaan situs. Tanggung jawab kami terbatas pada nilai pesanan
          terkait sejauh diizinkan oleh hukum yang berlaku.
        </p>
      </InfoSection>

      <InfoSection title="Kontak">
        <p>
          Pertanyaan terkait syarat layanan dapat disampaikan melalui halaman{" "}
          <Link href="/contact" className="font-semibold text-[#c85a2d] hover:underline">
            Hubungi Kami
          </Link>
          . Terakhir diperbarui: Mei 2026.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
