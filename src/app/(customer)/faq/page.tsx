import Link from "next/link";
import { FaqList, InfoPageShell } from "@/components/info/info-page-shell";
import { createInfoPageMetadata } from "@/lib/info-page-metadata";

// Static content — long ISR window; no DB roundtrip per visit.
export const revalidate = 86400;

export const metadata = createInfoPageMetadata({
  path: "/faq",
  title: "Pertanyaan Umum",
  description:
    "Jawaban seputar pemesanan, pembayaran, pengiriman, dan produk handmade D'TEMAN YOGA.",
});

const FAQ_ITEMS = [
  {
    question: "Apa itu D'TEMAN YOGA?",
    answer:
      "D'TEMAN YOGA adalah brand boneka rajut (Asana Charm) handmade yang dibuat dengan hati untuk menemani perjalanan yoga dan keseharian Anda.",
  },
  {
    question: "Bagaimana cara memesan?",
    answer:
      "Pilih produk di katalog, tambahkan ke keranjang, lalu lanjut checkout. Isi data penerima, pilih metode pengiriman, dan selesaikan pembayaran sesuai instruksi yang muncul.",
  },
  {
    question: "Metode pembayaran apa yang tersedia?",
    answer:
      "Saat ini pembayaran dilakukan melalui transfer bank. Detail rekening tujuan ditampilkan setelah pesanan dibuat. Unggah bukti transfer agar pesanan segera diverifikasi.",
  },
  {
    question: "Berapa lama pesanan diproses?",
    answer:
      "Produk handmade biasanya disiapkan dalam 1–3 hari kerja setelah pembayaran terverifikasi. Waktu transit kurir ditambahkan sesuai layanan dan kota tujuan.",
  },
  {
    question: "Bagaimana cara melacak pesanan?",
    answer:
      "Gunakan halaman Lacak Pesanan dengan kode pesanan (format ORD-YYYYMMDD-XXXXXX) yang Anda terima setelah checkout. Nomor resi akan tersedia setelah pesanan dikirim.",
  },
  {
    question: "Apakah bisa custom atau pre-order?",
    answer:
      "Beberapa produk mungkin dibuat sesuai pesanan dengan stok terbatas. Informasi ketersediaan ditampilkan di halaman produk masing-masing.",
  },
  {
    question: "Bagaimana jika ongkir tidak muncul saat checkout?",
    answer:
      "Pastikan alamat sudah lengkap hingga kelurahan/desa. Jika masih bermasalah, hubungi kami — tim admin dapat membantu pengiriman manual.",
  },
  {
    question: "Apakah bisa mengubah atau membatalkan pesanan?",
    answer:
      "Perubahan atau pembatalan masih memungkinkan selama pesanan belum diproses. Segera hubungi kami dengan menyertakan kode pesanan.",
  },
];

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="Bantuan"
      title="Pertanyaan Umum"
      description="Temukan jawaban cepat seputar belanja, pembayaran, dan pengiriman. Masih butuh bantuan? Tim kami siap membantu."
    >
      <FaqList items={FAQ_ITEMS} />

      <div className="rounded-[28px] border border-[#eadfce] bg-[#fbf8f4] p-6 md:p-8">
        <p className="text-[15px] leading-7 text-[#6b5b4b]">
          Tidak menemukan jawaban yang Anda cari?
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-flex font-semibold text-[#c85a2d] transition-colors hover:text-[#b14f27]"
        >
          Hubungi kami →
        </Link>
      </div>
    </InfoPageShell>
  );
}
