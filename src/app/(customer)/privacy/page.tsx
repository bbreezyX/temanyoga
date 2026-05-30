import { InfoPageShell, InfoSection } from "@/components/info/info-page-shell";
import { createInfoPageMetadata } from "@/lib/info-page-metadata";

// Static content — long ISR window; no DB roundtrip per visit.
export const revalidate = 86400;

export const metadata = createInfoPageMetadata({
  path: "/privacy",
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi D'TEMAN YOGA mengenai pengumpulan, penggunaan, dan perlindungan data pribadi pelanggan.",
});

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Kebijakan Privasi"
      description="Kami menghargai privasi Anda. Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana data tersebut digunakan."
    >
      <InfoSection title="Informasi yang Kami Kumpulkan">
        <p>Saat Anda berbelanja atau menghubungi kami, kami dapat mengumpulkan:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nama, alamat email, dan nomor telepon</li>
          <li>Alamat pengiriman lengkap</li>
          <li>Detail pesanan, bukti pembayaran, dan riwayat transaksi</li>
          <li>Pesan atau catatan yang Anda kirimkan kepada kami</li>
        </ul>
      </InfoSection>

      <InfoSection title="Bagaimana Informasi Digunakan">
        <ul className="list-disc space-y-2 pl-5">
          <li>Memproses dan mengirim pesanan Anda</li>
          <li>Mengirim pembaruan status pesanan via email atau WhatsApp</li>
          <li>Memberikan dukungan pelanggan</li>
          <li>Meningkatkan layanan dan keamanan situs</li>
        </ul>
      </InfoSection>

      <InfoSection title="Penyimpanan dan Keamanan">
        <p>
          Data disimpan di infrastruktur yang aman dan hanya diakses oleh pihak
          yang berwenang untuk keperluan operasional toko. Kami menerapkan
          langkah-langkah wajar untuk melindungi data dari akses tidak sah.
        </p>
      </InfoSection>

      <InfoSection title="Berbagi Data dengan Pihak Ketiga">
        <p>
          Kami dapat membagikan data yang diperlukan kepada mitra operasional
          seperti penyedia pengiriman dan layanan pembayaran/verifikasi hanya
          sejauh yang dibutuhkan untuk menyelesaikan pesanan Anda.
        </p>
      </InfoSection>

      <InfoSection title="Hak Anda">
        <p>
          Anda dapat meminta koreksi atau penghapusan data pribadi dengan
          menghubungi kami, kecuali data yang wajib disimpan untuk kepatuhan
          hukum atau catatan transaksi.
        </p>
      </InfoSection>

      <InfoSection title="Perubahan Kebijakan">
        <p>
          Kebijakan privasi dapat diperbarui sewaktu-waktu. Perubahan material
          akan diinformasikan melalui situs ini. Terakhir diperbarui: Mei 2026.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
