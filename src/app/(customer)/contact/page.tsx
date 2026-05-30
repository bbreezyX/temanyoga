import Link from "next/link";
import { Mail, MessageCircle, PackageSearch } from "lucide-react";
import { InfoPageShell, InfoSection } from "@/components/info/info-page-shell";
import { createInfoPageMetadata } from "@/lib/info-page-metadata";
import { getSiteSettings } from "@/lib/whatsapp";

// Site settings change rarely — ISR keeps navigation instant (served from cache,
// revalidated in the background) instead of a full SSR + DB roundtrip per visit.
export const revalidate = 600;

export const metadata = createInfoPageMetadata({
  path: "/contact",
  title: "Hubungi Kami",
  description:
    "Hubungi tim D'TEMAN YOGA untuk pertanyaan produk, pesanan, atau bantuan pengiriman.",
});

function buildWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("62")
      ? digits
      : digits;

  return `https://wa.me/${normalized}`;
}

export default async function ContactPage() {
  const settings = await getSiteSettings(["whatsapp_admin_phone", "whatsapp_enabled"]);
  const whatsappEnabled = settings.whatsapp_enabled === "true";
  const whatsappUrl = whatsappEnabled
    ? buildWhatsAppUrl(settings.whatsapp_admin_phone ?? "")
    : null;

  return (
    <InfoPageShell
      eyebrow="Bantuan"
      title="Hubungi Kami"
      description="Punya pertanyaan soal produk, pesanan, atau pengiriman? Kami akan membalas secepat mungkin pada jam operasional."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft transition-colors hover:border-[#c85a2d] md:p-8"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf8f4] transition-colors group-hover:bg-[#c85a2d]">
              <MessageCircle className="h-6 w-6 text-[#c85a2d] transition-colors group-hover:text-white" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[#2d241c]">
              WhatsApp
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-[#6b5b4b]">
              Cara tercepat untuk tanya stok, ongkir, atau status pesanan.
            </p>
            <p className="mt-4 font-semibold text-[#c85a2d]">Chat sekarang →</p>
          </a>
        ) : (
          <div className="rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft md:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf8f4]">
              <MessageCircle className="h-6 w-6 text-[#c85a2d]" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[#2d241c]">
              WhatsApp
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-[#6b5b4b]">
              Layanan WhatsApp belum tersedia saat ini. Silakan gunakan email di
              bawah atau lacak pesanan Anda.
            </p>
          </div>
        )}

        <div className="rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft md:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf8f4]">
            <Mail className="h-6 w-6 text-[#c85a2d]" />
          </div>
          <h2 className="font-display text-xl font-semibold text-[#2d241c]">
            Email
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-[#6b5b4b]">
            Untuk pertanyaan umum atau kendala teknis, kirim email ke:
          </p>
          <a
            href="mailto:cs@temaniyoga.com"
            className="mt-4 inline-flex font-semibold text-[#c85a2d] transition-colors hover:text-[#b14f27]"
          >
            cs@temaniyoga.com
          </a>
        </div>
      </div>

      <InfoSection title="Sebelum Menghubungi">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Siapkan kode pesanan jika menanyakan status order (
            <Link href="/track-order" className="font-semibold text-[#c85a2d] hover:underline">
              lacak di sini
            </Link>
            ).
          </li>
          <li>
            Cantumkan nama produk dan jumlah jika menanyakan ketersediaan stok.
          </li>
          <li>
            Untuk kendala ongkir, sertakan kelurahan/desa tujuan pengiriman.
          </li>
        </ul>
      </InfoSection>

      <div className="flex items-start gap-4 rounded-[28px] border border-[#eadfce] bg-[#fbf8f4] p-6 md:p-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
          <PackageSearch className="h-6 w-6 text-[#c85a2d]" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[#2d241c]">
            Sudah punya kode pesanan?
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-[#6b5b4b]">
            Cek status pesanan langsung tanpa perlu menunggu balasan.
          </p>
          <Link
            href="/track-order"
            className="mt-3 inline-flex font-semibold text-[#c85a2d] transition-colors hover:text-[#b14f27]"
          >
            Lacak pesanan →
          </Link>
        </div>
      </div>
    </InfoPageShell>
  );
}
