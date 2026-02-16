"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Clock,
  ArrowRight,
  ImageUp,
  PartyPopper,
  ScanSearch,
  List,
  ArrowUpRight,
  BadgeCheck,
  Settings,
  Truck,
  Home,
  Dot,
  Wallet,
} from "lucide-react";
import { apiUpload } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { PaymentProofResponse } from "@/types/api";

function PaymentUploadContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") ?? "TY-8F2A1";
  const totalValue = Number(searchParams.get("total") ?? 0);
  const shippingCostValue = Number(searchParams.get("shipping") ?? 0);
  const subtotalValue = totalValue - shippingCostValue;
  const now = new Date();
  const formattedDate = `${now.getDate()} Feb ${now.getFullYear()} • ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)
      ) {
        toast.error("File harus berupa JPEG, PNG, atau WebP");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !orderCode) return;

    setLoading(true);
    const res = await apiUpload<PaymentProofResponse>(
      `/api/orders/${orderCode}/payment-proof`,
      file,
    );
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengunggah bukti pembayaran");
      return;
    }

    setIsSuccess(true);
    toast.success("Bukti pembayaran berhasil diunggah!");
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard");
  };

  // SUCCESS SCREEN (After Upload)
  if (isSuccess) {
    return (
      <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[40px] p-10 shadow-soft text-center ring-1 ring-[#e8dcc8] max-w-md w-full animate-floatIn">
          <div className="h-24 w-24 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center mx-auto mb-8">
            <span className="grid place-items-center w-16 h-16 rounded-full bg-[#7a9d7f] text-white shadow-lg shadow-[#7a9d7f]/20">
              <CheckCircle2 className="h-10 w-10" />
            </span>
          </div>
          <h1 className="font-display text-[28px] font-black text-slate-900 mb-3">
            Bukti Terkirim!
          </h1>
          <p className="text-[#6b5b4b] mb-10 leading-relaxed text-[16px]">
            Terima kasih! Bukti pembayaran Anda telah kami terima. Tim kami akan
            memverifikasi pesanan Anda dalam 1-6 jam ke depan.
          </p>
          <div className="space-y-4">
            <Link
              href={`/track-order?code=${orderCode}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[64px] rounded-full bg-[#c85a2d] text-white font-bold text-[17px] shadow-soft hover:brightness-110 transition-all"
            >
              <ScanSearch className="w-5 h-5" />
              <span>Lacak Pesanan</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center w-full min-h-[64px] rounded-full bg-white ring-1 ring-[#e8dcc8] text-[#5a4a3b] font-bold text-[17px] hover:bg-[#fcfaf8] transition-all"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PENDING SCREEN (Waiting for Upload)
  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans pb-12">
      <main className="max-w-2xl mx-auto px-5 pt-6 space-y-7">
        {/* Hero Section - Awaiting Payment */}
        <section className="animate-floatIn">
          <div className="relative overflow-hidden rounded-[32px] bg-white shadow-soft ring-1 ring-[#e8dcc8] px-5 py-6">
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#c85a2d]/10 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-[#7a9d7f]/10 blur-2xl"></div>

            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-[#c85a2d] text-white shadow-sm">
                    <Wallet className="w-[18px] h-[18px]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-extrabold tracking-tight text-[20px] text-slate-900">
                    Pesanan Berhasil Dibuat
                  </h1>
                  <p className="mt-1 text-[14px] leading-6 text-[#6b5b4b]">
                    Satu langkah lagi! Silakan selesaikan pembayaran dan unggah
                    buktinya agar kami dapat memproses pesanan Anda.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[26px] bg-[#f5f1ed] ring-1 ring-[#e8dcc8] p-4 text-center">
                  <p className="text-[11px] font-semibold text-[#7a6a58]">
                    Kode pesanan
                  </p>
                  <button
                    onClick={() => copyCode(orderCode)}
                    className="mt-1 text-[16px] font-extrabold tracking-tight text-[#3f3328] hover:text-[#c85a2d] transition-colors"
                  >
                    {orderCode}
                  </button>
                </div>
                <div className="rounded-[26px] bg-[#f5f1ed] ring-1 ring-[#e8dcc8] p-4 text-center">
                  <p className="text-[11px] font-semibold text-[#7a6a58]">
                    Dipesan pada
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-[#3f3328]">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-[26px] bg-white ring-1 ring-[#e8dcc8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#7a6a58]">
                      Pelanggan
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-slate-900 leading-tight">
                      Alya Putri
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-semibold text-[#7a6a58]">
                      Total Tagihan
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-[#c85a2d]">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("upload-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 min-h-[52px] px-5 rounded-full bg-[#c85a2d] text-white font-semibold shadow-soft hover:brightness-110 transition-all"
                >
                  <ImageUp className="w-[18px] h-[18px]" />
                  <span>Unggah Bukti Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Status timeline section */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-[18px] tracking-tight font-extrabold text-slate-900">
                Status pesanan
              </h2>
              <p className="mt-1 text-[14px] text-[#6b5b4b]">
                Tahap saat ini:{" "}
                <span className="font-semibold text-[#c85a2d]">
                  Menunggu Pembayaran
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-[30px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-5">
            <ol className="relative space-y-4">
              <li className="relative flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-full bg-[#c85a2d] text-white grid place-items-center shadow-sm ring-2 ring-[#c85a2d]/25">
                    <Dot className="w-5 h-5" strokeWidth={4} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-extrabold text-slate-900">
                      Menunggu Pembayaran
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c85a2d] bg-[#c85a2d]/10 px-2 py-0.5 rounded">
                      Sekarang
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-[#6b5b4b]">
                    Silakan unggah bukti transfer agar kami dapat memverifikasi
                    pesanan Anda.
                  </p>
                </div>
              </li>

              {[
                {
                  label: "Pembayaran Diverifikasi",
                  icon: BadgeCheck,
                  desc: "Pesanan akan mulai diproses segera setelah bukti valid.",
                },
                {
                  label: "Sedang Diproses",
                  icon: Settings,
                  desc: "Persiapan produk dan pengemasan pesanan Anda.",
                },
                {
                  label: "Dikirim",
                  icon: Truck,
                  desc: "Paket Anda dalam perjalanan menuju alamat tujuan.",
                },
                {
                  label: "Diterima",
                  icon: Home,
                  desc: "Pesanan selesai—selamat menikmati TemanYoga.",
                },
              ].map((step, idx) => (
                <li key={idx} className="relative flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center text-[#7a6a58]">
                      <step.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-extrabold text-[#3f3328]">
                      {step.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[#6b5b4b] opacity-60">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Payment Confirmation Section */}
        <section id="upload-section" className="space-y-4">
          <h2 className="font-display text-[18px] tracking-tight font-extrabold text-slate-900">
            Konfirmasi Pembayaran
          </h2>
          <div className="rounded-[30px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-5 space-y-5">
            <div className="grid gap-3">
              <div className="p-4 rounded-[26px] bg-[#fcfaf8] ring-1 ring-[#e8dcc8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-[14px]">Bank BCA</span>
                  <button
                    onClick={() => copyCode("1234567890")}
                    className="text-[#c85a2d] text-[12px] font-bold hover:underline"
                  >
                    Salin No.
                  </button>
                </div>
                <p className="text-[18px] font-mono font-bold tracking-tight">
                  123 456 7890
                </p>
                <p className="text-[12px] text-[#6b5b4b] mt-1">
                  a/n TemanYoga Studio
                </p>
              </div>
              <div className="p-4 rounded-[26px] bg-[#fcfaf8] ring-1 ring-[#e8dcc8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-[14px]">
                    Bank Mandiri
                  </span>
                  <button
                    onClick={() => copyCode("0987654321")}
                    className="text-[#c85a2d] text-[12px] font-bold hover:underline"
                  >
                    Salin No.
                  </button>
                </div>
                <p className="text-[18px] font-mono font-bold tracking-tight">
                  098 765 4321
                </p>
                <p className="text-[12px] text-[#6b5b4b] mt-1">
                  a/n TemanYoga Studio
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block cursor-pointer group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <div className="rounded-[30px] bg-white border-2 border-dashed border-[#e8dcc8] p-8 text-center group-hover:bg-[#fcfaf8] group-hover:border-[#c85a2d]/30 transition-all min-h-[160px] flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden ring-1 ring-[#e8dcc8]">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain bg-white"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#fcfaf8] ring-1 ring-[#e8dcc8] grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageUp className="w-6 h-6 text-[#c85a2d]" />
                      </div>
                      <p className="text-[14px] font-extrabold">Unggah Bukti</p>
                      <p className="text-[12px] text-[#6b5b4b] mt-0.5">
                        PNG, JPG, WebP hingga 5MB
                      </p>
                    </>
                  )}
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full min-h-[56px] rounded-full bg-[#c85a2d] text-white font-bold text-[16px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Bukti Pembayaran</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Order details section */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-[18px] tracking-tight font-extrabold text-slate-900">
                Detail pesanan
              </h2>
              <p className="mt-1 text-[14px] text-[#6b5b4b]">
                Detail pengiriman dan informasi tagihan.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-[#7a6a58]">
                  Alamat Pengiriman
                </p>
                <p className="mt-1 text-[14px] leading-6 text-[#3f3328]">
                  Jl. Kemuning No. 18, RT 02/RW 05, Tebet
                  <br />
                  Jakarta Selatan, 12820
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold text-[#7a6a58]">
                  Metode Bayar
                </p>
                <p className="mt-1 text-[13px] font-bold text-[#3f3328]">
                  Transfer Bank
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e8dcc8] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#6b5b4b]">
                  Subtotal Produk
                </p>
                <p className="text-[13px] font-extrabold text-[#3f3328]">
                  {formatCurrency(subtotalValue)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#6b5b4b]">
                  Ongkos Kirim
                </p>
                <p className="text-[13px] font-extrabold text-[#3f3328]">
                  {shippingCostValue === 0
                    ? <span className="text-[#7a9d7f]">Gratis</span>
                    : formatCurrency(shippingCostValue)}
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[15px] font-black text-slate-900">
                  Total Tagihan
                </p>
                <p className="text-[15px] font-black text-[#c85a2d]">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-12 text-center">
          <p className="text-[12px] text-[#6b5b4b]">
            © TemanYoga · Hubungi kami jika ada kendala
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center text-[#c85a2d]">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      }
    >
      <PaymentUploadContent />
    </Suspense>
  );
}
