"use client";

import { Suspense, useState, useRef, useEffect, use } from "react";
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
  Truck,
  Home,
  Dot,
  Copy,
  Mail,
  Clock,
} from "lucide-react";
import { apiUpload, apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { PaymentProofResponse, OrderStatusResponse } from "@/types/api";

const CONFETTI_STYLES: React.CSSProperties[] = [
  {
    left: "10%",
    top: "15%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.2s",
    animationDuration: "3s",
  },
  {
    left: "25%",
    top: "70%",
    backgroundColor: "#7a9d7f",
    animationDelay: "0.6s",
    animationDuration: "3.5s",
  },
  {
    left: "40%",
    top: "25%",
    backgroundColor: "#e8dcc8",
    animationDelay: "1.0s",
    animationDuration: "2.8s",
  },
  {
    left: "55%",
    top: "80%",
    backgroundColor: "#c85a2d",
    animationDelay: "0.4s",
    animationDuration: "3.2s",
  },
  {
    left: "70%",
    top: "20%",
    backgroundColor: "#7a9d7f",
    animationDelay: "1.2s",
    animationDuration: "3.8s",
  },
  {
    left: "85%",
    top: "60%",
    backgroundColor: "#e8dcc8",
    animationDelay: "0.8s",
    animationDuration: "3s",
  },
];

function PaymentUploadContent({ orderCode }: { orderCode: string }) {
  const searchParams = useSearchParams();
  const toast = useToast();

  const [orderData, setOrderData] = useState<OrderStatusResponse | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailForVerification, setEmailForVerification] = useState<string>(
    () => {
      // Need to handle this carefully since it's a client component
      if (typeof window === "undefined") return "";
      return (
        sessionStorage.getItem(`checkout_email_${orderCode}`) ||
        searchParams.get("email") ||
        ""
      );
    },
  );
  const [showEmailInput, setShowEmailInput] = useState(() => {
    if (typeof window === "undefined") return false;
    return !(
      sessionStorage.getItem(`checkout_email_${orderCode}`) ||
      searchParams.get("email")
    );
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalValue = orderData?.totalAmount ?? 0;
  const shippingCostValue = orderData?.shippingCost ?? 0;
  const discountValue = orderData?.discountAmount ?? 0;
  const couponCodeParam = orderData?.couponCode;
  const subtotalValue = totalValue + discountValue - shippingCostValue;

  const [notFound, setNotFound] = useState(false);
  const [bankSettings, setBankSettings] = useState({
    bank_name: "BCA",
    bank_account_number: "1234567890",
    bank_account_name: "D'TEMAN YOGA Studio",
  });

  useEffect(() => {
    apiFetch<typeof bankSettings>("/api/settings").then((res) => {
      if (res.success) {
        setBankSettings(res.data);
      }
    });

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
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-3xl font-black mb-4 text-[#2d241c]">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="text-[#6b5b4b] mb-10 max-w-sm">
          Maaf, kami tidak dapat menemukan pesanan dengan kode tersebut. Silakan
          cek kembali kode pesanan Anda.
        </p>
        <Link
          href="/products"
          className="px-10 py-5 bg-[#2d241c] text-white rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-[#c85a2d] transition-all shadow-lift border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          Kembali Berbelanja
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

    if (!emailForVerification) {
      setShowEmailInput(true);
      toast.error("Mohon masukkan email untuk verifikasi");
      return;
    }

    setLoading(true);
    const res = await apiUpload<PaymentProofResponse>(
      `/api/orders/${orderCode}/payment-proof`,
      file,
      { email: emailForVerification },
    );
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengunggah bukti pembayaran");
      if (res.error?.toLowerCase().includes("email")) {
        setShowEmailInput(true);
      }
      return;
    }

    setIsSuccess(true);
    window.scrollTo(0, 0);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SUCCESS SCREEN (After Upload)
  if (isSuccess) {
    return (
      <div className="bg-white min-h-screen text-[#2d241c] font-sans flex flex-col items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
          {CONFETTI_STYLES.map((style, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-floatIn"
              style={style}
            />
          ))}
        </div>

        <div className="max-w-xl w-full text-center animate-floatIn relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#7a9d7f]/10 text-[#7a9d7f] mb-10">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-black text-[#2d241c] mb-6 leading-tight">
            Pembayaran Berhasil Dikirim
          </h1>
          <p className="text-[#6b5b4b] mb-12 leading-relaxed text-[16px] max-w-md mx-auto">
            Terima kasih! Bukti pembayaran Anda telah kami terima. Tim kami akan
            memverifikasi pesanan Anda dalam{" "}
            <span className="font-black text-[#2d241c]">1-6 jam</span>, lalu
            memulai produksi handmade khusus untuk Anda.
          </p>

          <div className="bg-[#f9f9f9] border border-[#e8dcc8]/60 rounded-[40px] p-8 md:p-10 mb-12 text-left">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#e8dcc8]/40">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c85a2d] mb-1">
                  Nomor Pesanan
                </p>
                <p className="text-2xl font-black text-[#2d241c]">
                  {orderCode}
                </p>
              </div>
              <button
                onClick={() => copyCode(orderCode)}
                className={`w-12 h-12 rounded-full border transition-all shadow-sm group flex items-center justify-center ${
                  copied
                    ? "bg-[#7a9d7f] border-[#7a9d7f] text-white"
                    : "bg-white border-[#e8dcc8] text-[#c85a2d] hover:bg-[#c85a2d] hover:text-white"
                }`}
              >
                {copied ? (
                  <BadgeCheck className="w-5 h-5 animate-in zoom-in duration-300" />
                ) : (
                  <Copy className="w-5 h-5 transition-transform group-active:scale-90" />
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#7a9d7f]/20 text-[#7a9d7f] flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[14px] font-black text-[#2d241c] uppercase tracking-wider mb-1">
                    Verifikasi Manual
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                    Tim admin kami sedang mengecek bukti transfer Anda untuk
                    validasi pesanan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#c85a2d]/10 text-[#c85a2d] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[14px] font-black text-[#2d241c] uppercase tracking-wider mb-1">
                    Update Status
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                    Anda akan menerima notifikasi otomatis via WhatsApp dan
                    Email saat pesanan mulai diproses.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[#e8dcc8]/40">
              <div className="flex items-start gap-3 opacity-60">
                <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed text-[#6b5b4b]">
                  Email konfirmasi telah dikirim. Jika tidak ada, mohon cek
                  folder <strong>Spam</strong> atau <strong>Promosi</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/track-order/${orderCode}`}
              className="inline-flex items-center justify-center gap-3 h-[64px] px-12 rounded-[22px] bg-[#c85a2d] text-white font-black text-[15px] uppercase tracking-widest transition-all shadow-lift border-t border-white/20 hover:bg-[#2d241c] hover:scale-[1.02] active:scale-[0.98] group w-full sm:w-auto min-w-[240px]"
            >
              <ScanSearch className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Lacak Pesanan</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-[64px] px-12 rounded-[22px] bg-white border-2 border-[#e8dcc8] text-[#2d241c] font-black text-[15px] uppercase tracking-widest hover:border-[#c85a2d] hover:bg-[#f9f9f9] transition-all shadow-soft active:scale-[0.98] w-full sm:w-auto min-w-[240px]"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>

        <p className="mt-12 text-[12px] text-[#6b5b4b] opacity-60">
          Ada kendala?{" "}
          <Link
            href="/contact"
            className="underline font-bold hover:text-[#c85a2d]"
          >
            Hubungi Customer Service
          </Link>
        </p>
      </div>
    );
  }

  // PENDING SCREEN (Waiting for Upload)
  return (
    <div className="bg-white min-h-screen text-[#2d241c] font-sans pb-24">
      <main className="max-w-4xl mx-auto px-6 md:px-12 pt-12 md:pt-20 space-y-16">
        {/* Header Header */}
        <section className="animate-floatIn">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-[#c85a2d]" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                  Order Placed
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black text-[#2d241c] leading-tight mb-6">
                Pesanan Berhasil Dibuat
              </h1>
              <p className="text-[16px] md:text-[18px] leading-relaxed text-[#6b5b4b] max-w-xl">
                Satu langkah lagi! Silakan selesaikan pembayaran dan unggah
                buktinya agar kami dapat segera memproses pesanan handmade Anda.
              </p>

              <div className="mt-10">
                <button
                  onClick={() => {
                    const el = document.getElementById("upload-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex items-center gap-3 h-14 px-10 rounded-[20px] bg-gradient-to-br from-[#d97e5a] to-[#c85a2d] text-white font-black text-[14px] uppercase tracking-widest hover:to-[#b64a1d] transition-all shadow-lift border border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ImageUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                  <span>Unggah Bukti Sekarang</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-64 space-y-4">
              <div className="p-6 rounded-[32px] bg-[#f9f9f9] border border-[#e8dcc8]/60 text-center">
                <p className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-widest mb-1">
                  Kode Pesanan
                </p>
                <button
                  onClick={() => copyCode(orderCode)}
                  className="flex items-center justify-center gap-2 w-full text-xl font-black text-[#2d241c] hover:text-[#c85a2d] transition-colors"
                >
                  <span>{orderCode}</span>
                  <Copy className="w-4 h-4 opacity-30" />
                </button>
              </div>
              <div className="p-6 rounded-[32px] bg-[#f9f9f9] border border-[#e8dcc8]/60 text-center">
                <p className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-widest mb-1">
                  Dipesan pada
                </p>
                <p className="text-[15px] font-bold text-[#2d241c]">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-12 space-y-20">
            {/* Payment & Upload Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Payment Details */}
              <section id="upload-section" className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2d241c] text-white text-xs font-black">
                    1
                  </span>
                  <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                    Informasi Pembayaran
                  </h2>
                </div>

                <div className="rounded-[40px] bg-[#f9f9f9] border border-[#e8dcc8]/60 p-8 md:p-10 space-y-8">
                  <div className="space-y-4">
                    <p className="text-[14px] text-[#6b5b4b]">
                      Silakan transfer ke rekening berikut:
                    </p>
                    <div className="p-8 rounded-[32px] bg-white border border-[#e8dcc8]/40 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c85a2d]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] font-black text-[#c85a2d] uppercase tracking-widest">
                          Bank {bankSettings.bank_name}
                        </span>
                        <button
                          onClick={() =>
                            copyCode(bankSettings.bank_account_number)
                          }
                          className="text-[#6b5b4b] hover:text-[#c85a2d] transition-colors"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-3xl font-black tracking-tight text-[#2d241c] mb-2 group-hover:text-[#c85a2d] transition-colors">
                        {bankSettings.bank_account_number.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          "$1 $2 $3",
                        )}
                      </p>
                      <p className="text-[14px] font-bold text-[#6b5b4b]">
                        a/n {bankSettings.bank_account_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {showEmailInput && (
                      <div className="space-y-3">
                        <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-widest px-1">
                          Email Verifikasi
                        </label>
                        <input
                          type="email"
                          value={emailForVerification}
                          onChange={(e) =>
                            setEmailForVerification(e.target.value)
                          }
                          placeholder="Email yang Anda gunakan saat memesan"
                          className="h-14 w-full rounded-2xl bg-white border border-[#e8dcc8] px-6 text-[16px] focus:border-[#c85a2d] outline-none transition-all shadow-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-widest px-1">
                        Bukti Transfer
                      </label>
                      <label className="block cursor-pointer group">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        <div className="rounded-[32px] bg-white border-2 border-dashed border-[#e8dcc8] p-10 text-center group-hover:border-[#c85a2d] transition-all flex flex-col items-center justify-center min-h-[220px]">
                          {imagePreview ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-black text-sm uppercase tracking-widest">
                                  Ganti Gambar
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-full bg-[#f9f9f9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ImageUp className="w-8 h-8 text-[#c85a2d]" />
                              </div>
                              <p className="text-[15px] font-black text-[#2d241c] mb-1">
                                Klik untuk pilih file
                              </p>
                              <p className="text-[13px] text-[#6b5b4b]">
                                JPEG, PNG, WebP (Maks. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!file || loading}
                      className="group relative overflow-hidden w-full h-16 rounded-[20px] bg-gradient-to-br from-[#d97e5a] to-[#c85a2d] text-white font-black text-[15px] uppercase tracking-widest shadow-lift hover:to-[#b64a1d] transition-all disabled:opacity-30 disabled:shadow-none translate-z-0 flex items-center justify-center gap-3 border border-white/20 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>MENGIRIM...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Bukti Pembayaran</span>
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* Order Details Summary */}
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2d241c] text-white text-xs font-black">
                    2
                  </span>
                  <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                    Ringkasan Pesanan
                  </h2>
                </div>

                <div className="rounded-[40px] bg-[#f9f9f9] border border-[#e8dcc8]/60 overflow-hidden shadow-sm flex flex-col">
                  <div className="p-8 md:p-10 space-y-8 flex-1">
                    <div className="flex justify-between gap-6">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#c85a2d] uppercase tracking-[0.2em] mb-1">
                          Pelanggan
                        </p>
                        <p className="text-xl font-black text-[#2d241c] truncate">
                          {orderData?.customerName || "..."}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em] mb-1">
                          Metode Bayar
                        </p>
                        <p className="text-[15px] font-bold text-[#2d241c]">
                          Transfer Bank
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#6b5b4b] uppercase tracking-[0.2em] mb-2">
                        Alamat Pengiriman
                      </p>
                      <p className="text-[15px] leading-relaxed text-[#2d241c] line-clamp-3">
                        {orderData?.shippingAddress || "..."}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-[#e8dcc8]/40 space-y-4">
                      <div className="flex justify-between items-center text-[15px] opacity-60">
                        <span>Subtotal Produk</span>
                        <span>{formatCurrency(subtotalValue)}</span>
                      </div>
                      {discountValue > 0 && (
                        <div className="flex justify-between items-center text-[15px] text-[#7a9d7f] font-bold">
                          <span>
                            Diskon
                            {couponCodeParam ? ` (${couponCodeParam})` : ""}
                          </span>
                          <span>-{formatCurrency(discountValue)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[15px] opacity-60">
                        <span>Ongkos Kirim</span>
                        <span>
                          {shippingCostValue === 0
                            ? "Gratis"
                            : formatCurrency(shippingCostValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 md:px-10 py-10 bg-[#2d241c] text-white">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-[18px] opacity-80">
                        Total Tagihan
                      </span>
                      <span className="text-4xl font-black tracking-tight text-[#c85a2d]">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-[#fdf8f6] border border-[#c85a2d]/20 flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#c85a2d] shrink-0 mt-1" />
                  <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                    Detail pembayaran dan pesanan telah kami kirim ke email
                    Anda. Cek folder <strong>Spam</strong> jika email konfirmasi
                    tidak muncul di inbox.
                  </p>
                </div>
              </section>
            </div>

            {/* Order Timeline */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2d241c] text-white text-xs font-black">
                  3
                </span>
                <h2 className="font-display font-black tracking-tight text-2xl text-[#2d241c]">
                  Tahapan Pesanan
                </h2>
              </div>

              <div className="rounded-[40px] bg-white border border-[#e8dcc8]/60 p-8 md:p-12 overflow-hidden relative shadow-sm">
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#c85a2d] bg-[#c85a2d]/10 px-4 py-1.5 rounded-full">
                    Status: Menunggu Pembayaran
                  </span>
                </div>

                <div className="relative mt-8">
                  <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-[#f9f9f9]" />
                  <ol className="relative space-y-10">
                    <li className="relative flex items-start gap-6">
                      <div className="shrink-0 z-10">
                        <div className="w-9 h-9 rounded-full bg-[#c85a2d] text-white flex items-center justify-center ring-8 ring-white shadow-sm">
                          <Dot className="w-6 h-6" strokeWidth={4} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-[16px] font-black text-[#2d241c] mb-1">
                          Menunggu Pembayaran
                        </p>
                        <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                          Silakan unggah bukti transfer agar admin kami dapat
                          memulai proses verifikasi.
                        </p>
                      </div>
                    </li>

                    {[
                      {
                        label: "Pembayaran Diverifikasi",
                        icon: BadgeCheck,
                        desc: "Sistem mengonfirmasi bukti transfer dan memvalidasi pesanan Anda.",
                      },
                      {
                        label: "Proses Produksi",
                        icon: Clock,
                        desc: "Produk handmade Anda mulai dikerjakan (membutuhkan waktu ±3 minggu).",
                      },
                      {
                        label: "Pesanan Dikirim",
                        icon: Truck,
                        desc: "Paket diserahkan ke kurir dan nomor resi akan diinformasikan.",
                      },
                      {
                        label: "Pesanan Diterima",
                        icon: Home,
                        desc: "Selamat menikmati produk baru Anda dari Teman Yoga.",
                      },
                    ].map((step, idx) => (
                      <li
                        key={idx}
                        className="relative flex items-start gap-6 opacity-40"
                      >
                        <div className="shrink-0 z-10">
                          <div className="w-9 h-9 rounded-full bg-[#f9f9f9] border border-[#e8dcc8] flex items-center justify-center ring-8 ring-white">
                            <step.icon className="w-4 h-4 text-[#6b5b4b]" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-[16px] font-bold text-[#6b5b4b] mb-1">
                            {step.label}
                          </p>
                          <p className="text-[14px] leading-relaxed text-[#6b5b4b]">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="pt-20 text-center border-t border-[#e8dcc8]/40">
          <p className="text-[12px] font-bold text-[#6b5b4b] uppercase tracking-[0.3em]">
            D`Teman Yoga · Jambi, Indonesia
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-[#c85a2d]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest opacity-40">
              Memuat Pesanan...
            </p>
          </div>
        </div>
      }
    >
      <PaymentUploadContent orderCode={orderCode} />
    </Suspense>
  );
}
