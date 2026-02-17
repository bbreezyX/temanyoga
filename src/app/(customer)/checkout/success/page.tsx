"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  ImageUp,
  ScanSearch,
  BadgeCheck,
  Settings,
  Truck,
  Home,
  Dot,
  Wallet,
  Copy,
} from "lucide-react";
import { apiUpload, apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { PaymentProofResponse, OrderStatusResponse } from "@/types/api";

const CONFETTI_STYLES: React.CSSProperties[] = [
  {
    left: "5%",
    top: "10%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.2s",
    animationDuration: "3.1s",
  },
  {
    left: "15%",
    top: "85%",
    backgroundColor: "#7a9d7f",
    animationDelay: "0.8s",
    animationDuration: "4.5s",
  },
  {
    left: "25%",
    top: "40%",
    backgroundColor: "#e8dcc8",
    animationDelay: "1.2s",
    animationDuration: "2.8s",
  },
  {
    left: "35%",
    top: "65%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.5s",
    animationDuration: "3.9s",
  },
  {
    left: "45%",
    top: "20%",
    backgroundColor: "#7a9d7f",
    animationDelay: "1.5s",
    animationDuration: "4.1s",
  },
  {
    left: "55%",
    top: "80%",
    backgroundColor: "#e8dcc8",
    animationDelay: "0.3s",
    animationDuration: "3.3s",
  },
  {
    left: "65%",
    top: "30%",
    backgroundColor: "#c85a2d",
    animationDelay: "1.8s",
    animationDuration: "4.7s",
  },
  {
    left: "75%",
    top: "55%",
    backgroundColor: "#7a9d7f",
    animationDelay: "0.9s",
    animationDuration: "2.5s",
  },
  {
    left: "85%",
    top: "15%",
    backgroundColor: "#e8dcc8",
    animationDelay: "1.4s",
    animationDuration: "3.8s",
  },
  {
    left: "95%",
    top: "70%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.6s",
    animationDuration: "4.3s",
  },
  {
    left: "10%",
    top: "35%",
    backgroundColor: "#7a9d7f",
    animationDelay: "1.1s",
    animationDuration: "2.9s",
  },
  {
    left: "20%",
    top: "90%",
    backgroundColor: "#e8dcc8",
    animationDelay: "0.4s",
    animationDuration: "3.7s",
  },
  {
    left: "30%",
    top: "15%",
    backgroundColor: "#c85a2d",
    animationDelay: "1.6s",
    animationDuration: "4.6s",
  },
  {
    left: "40%",
    top: "75%",
    backgroundColor: "#7a9d7f",
    animationDelay: "0.7s",
    animationDuration: "3.2s",
  },
  {
    left: "50%",
    top: "45%",
    backgroundColor: "#e8dcc8",
    animationDelay: "1.3s",
    animationDuration: "4.0s",
  },
  {
    left: "60%",
    top: "10%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.2s",
    animationDuration: "2.7s",
  },
  {
    left: "70%",
    top: "85%",
    backgroundColor: "#7a9d7f",
    animationDelay: "1.9s",
    animationDuration: "4.4s",
  },
  {
    left: "80%",
    top: "40%",
    backgroundColor: "#e8dcc8",
    animationDelay: "1.0s",
    animationDuration: "3.5s",
  },
  {
    left: "90%",
    top: "60%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.1s",
    animationDuration: "3.9s",
  },
  {
    left: "15%",
    top: "25%",
    backgroundColor: "#7a9d7f",
    animationDelay: "0.8s",
    animationDuration: "4.2s",
  },
];

function PaymentUploadContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const orderCode = searchParams.get("code") ?? "";

  const [orderData, setOrderData] = useState<OrderStatusResponse | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalValue =
    orderData?.totalAmount ?? Number(searchParams.get("total") ?? 0);
  const shippingCostValue =
    orderData?.shippingCost ?? Number(searchParams.get("shipping") ?? 0);
  const discountValue =
    orderData?.discountAmount ?? Number(searchParams.get("discount") ?? 0);
  const couponCodeParam = orderData?.couponCode ?? searchParams.get("coupon");
  const subtotalValue = totalValue + discountValue - shippingCostValue;

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (orderCode) {
      apiFetch<OrderStatusResponse>(`/api/orders/${orderCode}/status`).then(
        (res) => {
          if (res.success) {
            setOrderData(res.data);
          } else {
            setNotFound(true);
          }
        },
      );
    }
  }, [orderCode]);

  if (notFound) {
    return (
      <div className="bg-[#f5f1ed] min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="font-display text-2xl font-black mb-4">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="text-[#6b5b4b] mb-8">
          Maaf, kami tidak dapat menemukan pesanan dengan kode tersebut.
        </p>
        <Link
          href="/products"
          className="px-8 py-3 bg-[#c85a2d] text-white rounded-full font-bold"
        >
          Kembali Belanja
        </Link>
      </div>
    );
  }

  const now = orderData ? new Date(orderData.createdAt) : new Date();
  const formattedDate = `${now.getDate()} ${now.toLocaleString("id-ID", { month: "short" })} ${now.getFullYear()} • ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

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
      <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Simple CSS Confetti (Background) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {CONFETTI_STYLES.map((style, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-floatIn"
              style={style}
            />
          ))}
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-lift text-center ring-1 ring-[#e8dcc8] max-w-md w-full animate-floatIn relative z-10">
          <div className="h-28 w-28 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center mx-auto mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-[#7a9d7f]/20 animate-ping" />
            <span className="grid place-items-center w-20 h-20 rounded-full bg-[#7a9d7f] text-white shadow-lg shadow-[#7a9d7f]/20 relative z-10">
              <CheckCircle2 className="h-12 w-12" />
            </span>
          </div>

          <h1 className="font-display text-[32px] font-black text-slate-900 mb-2 leading-tight">
            Bukti Terkirim!
          </h1>
          <p className="text-[#6b5b4b] mb-8 leading-relaxed text-[15px]">
            Terima kasih! Bukti pembayaran Anda telah kami terima. Tim kami akan
            memverifikasi pesanan Anda dalam{" "}
            <span className="font-bold">1-6 jam</span> ke depan.
          </p>

          <div className="bg-[#fcfaf8] rounded-[28px] ring-1 ring-[#e8dcc8] p-5 mb-10 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e8dcc8]/50">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7a6a58]">
                  Nomor Pesanan
                </p>
                <p className="text-[18px] font-black text-[#3f3328]">
                  {orderCode}
                </p>
              </div>
              <button
                onClick={() => copyCode(orderCode)}
                className="w-10 h-10 rounded-full bg-white ring-1 ring-[#e8dcc8] grid place-items-center text-[#c85a2d] hover:bg-[#f5f1ed] transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7a9d7f]/10 text-[#7a9d7f] grid place-items-center shrink-0 mt-0.5">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-[13px] leading-relaxed text-[#6b5b4b]">
                  <span className="font-bold text-[#3f3328]">
                    Verifikasi Manual:
                  </span>{" "}
                  Tim admin kami akan mengecek bukti transfer Anda.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7a9d7f]/10 text-[#7a9d7f] grid place-items-center shrink-0 mt-0.5">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <p className="text-[13px] leading-relaxed text-[#6b5b4b]">
                  <span className="font-bold text-[#3f3328]">
                    Notifikasi WA/Email:
                  </span>{" "}
                  Anda akan menerima kabar saat status berubah menjadi{" "}
                  <span className="italic">Dikirim</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              href={`/track-order?code=${orderCode}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[60px] rounded-full bg-[#c85a2d] text-white font-bold text-[16px] shadow-soft hover:brightness-110 active:scale-95 transition-all group"
            >
              <ScanSearch className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Lacak Pesanan</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center w-full min-h-[60px] rounded-full bg-white ring-1 ring-[#e8dcc8] text-[#5a4a3b] font-bold text-[16px] hover:bg-[#fcfaf8] active:scale-95 transition-all"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>

        <p
          className="mt-8 text-[12px] text-[#6b5b4b] animate-floatIn"
          style={{ animationDelay: "0.4s" }}
        >
          Ada masalah?{" "}
          <Link href="/contact" className="underline font-bold">
            Hubungi Support
          </Link>
        </p>
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
                <div className="rounded-[26px] bg-[#f5f1ed] ring-1 ring-[#e8dcc8] p-4 text-center group transition-all hover:bg-white hover:shadow-soft">
                  <p className="text-[11px] font-semibold text-[#7a6a58]">
                    Kode pesanan
                  </p>
                  <button
                    onClick={() => copyCode(orderCode)}
                    className="mt-1 flex items-center justify-center gap-2 w-full text-[16px] font-extrabold tracking-tight text-[#3f3328] group-hover:text-[#c85a2d] transition-colors"
                  >
                    <span>{orderCode}</span>
                    <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
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
                      {orderData?.customerName || "..."}
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
              {/* Vertical line connecting steps */}
              <div className="absolute left-[17.5px] top-5 bottom-5 w-0.5 bg-[#e8dcc8]" />

              <li className="relative flex items-start gap-3">
                <div className="shrink-0 z-10">
                  <div className="w-9 h-9 rounded-full bg-[#c85a2d] text-white grid place-items-center shadow-sm ring-4 ring-white">
                    <Dot className="w-5 h-5" strokeWidth={4} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-extrabold text-slate-900">
                      Menunggu Pembayaran
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c85a2d] bg-[#c85a2d]/10 px-2 py-0.5 rounded animate-pulse">
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
                  <div className="shrink-0 z-10">
                    <div className="w-9 h-9 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center text-[#7a6a58] shadow-sm ring-4 ring-white">
                      <step.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
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
              <div className="p-4 rounded-[26px] bg-[#fcfaf8] ring-1 ring-[#e8dcc8] hover:shadow-soft transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-[14px]">Bank BCA</span>
                  <button
                    onClick={() => copyCode("1234567890")}
                    className="flex items-center gap-1.5 text-[#c85a2d] text-[12px] font-bold hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    Salin No.
                  </button>
                </div>
                <p className="text-[18px] font-mono font-bold tracking-tight text-[#3f3328] group-hover:text-[#c85a2d] transition-colors">
                  123 456 7890
                </p>
                <p className="text-[12px] text-[#6b5b4b] mt-1">
                  a/n TemanYoga Studio
                </p>
              </div>
              <div className="p-4 rounded-[26px] bg-[#fcfaf8] ring-1 ring-[#e8dcc8] hover:shadow-soft transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-[14px]">
                    Bank Mandiri
                  </span>
                  <button
                    onClick={() => copyCode("0987654321")}
                    className="flex items-center gap-1.5 text-[#c85a2d] text-[12px] font-bold hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    Salin No.
                  </button>
                </div>
                <p className="text-[18px] font-mono font-bold tracking-tight text-[#3f3328] group-hover:text-[#c85a2d] transition-colors">
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
                className="relative overflow-hidden w-full min-h-[60px] rounded-full bg-[#c85a2d] text-white font-bold text-[17px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group shadow-soft"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sedang Mengirim...</span>
                  </>
                ) : (
                  <>
                    {!file && <Wallet className="w-5 h-5 opacity-50" />}
                    <span>Kirim Bukti Pembayaran</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}

                {/* Shine animation on hover when enabled */}
                {!loading && file && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
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
                <p className="mt-1 text-[14px] leading-6 text-[#3f3328] whitespace-pre-line">
                  {orderData?.shippingAddress || "..."}
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
              {discountValue > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#7a9d7f]">
                    Diskon{couponCodeParam ? ` (${couponCodeParam})` : ""}
                  </p>
                  <p className="text-[13px] font-extrabold text-[#7a9d7f]">
                    -{formatCurrency(discountValue)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#6b5b4b]">
                  Ongkos Kirim
                </p>
                <p className="text-[13px] font-extrabold text-[#3f3328]">
                  {shippingCostValue === 0 ? (
                    <span className="text-[#7a9d7f]">Gratis</span>
                  ) : (
                    formatCurrency(shippingCostValue)
                  )}
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
