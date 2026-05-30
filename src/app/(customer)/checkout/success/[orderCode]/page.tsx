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
  BadgeCheck,
  Truck,
  Copy,
  Mail,
  ScanSearch,
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

  // ───────────────────  SUCCESS SCREEN (after upload)  ──────────────────
  if (isSuccess) {
    return (
      <div className="relative -mt-20 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas-oat px-5 py-24 font-sans text-ink md:-mt-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          {CONFETTI_STYLES.map((style, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full animate-floatIn"
              style={style}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-xl text-center animate-floatIn">
          <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-sage/15 text-sage">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <h1 className="font-bungee text-[clamp(1.9rem,7vw,3.25rem)] leading-[1.02] text-ink">
            Pembayaran Terkirim
          </h1>
          <p className="mx-auto mb-10 mt-5 max-w-md leading-relaxed text-ink-soft">
            Terima kasih! Bukti pembayaran Anda telah kami terima. Tim kami akan
            memverifikasi pesanan dalam{" "}
            <span className="font-bold text-ink">1–6 jam</span>, lalu memulai
            produksi handmade khusus untuk Anda.
          </p>

          <div className="mb-10 rounded-[32px] border border-black/5 bg-paper p-7 text-left sm:p-9">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-black/5 pb-8">
              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-action">
                  Nomor Pesanan
                </p>
                <p className="break-all text-2xl font-bold text-ink">
                  {orderCode}
                </p>
              </div>
              <button
                onClick={() => copyCode(orderCode)}
                aria-label="Salin nomor pesanan"
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all ${
                  copied
                    ? "border-sage bg-sage text-white"
                    : "border-black/10 bg-paper text-action hover:bg-action hover:text-white"
                }`}
              >
                {copied ? (
                  <BadgeCheck className="h-5 w-5 animate-in zoom-in duration-300" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-bold uppercase tracking-wide text-ink">
                    Verifikasi Manual
                  </p>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Tim admin kami sedang mengecek bukti transfer Anda untuk
                    validasi pesanan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action/10 text-action">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-bold uppercase tracking-wide text-ink">
                    Update Status
                  </p>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Anda akan menerima notifikasi otomatis via WhatsApp dan
                    Email saat pesanan mulai diproses.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 border-t border-black/5 pt-7 text-ink-soft">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-[12px] leading-relaxed">
                Email konfirmasi telah dikirim. Jika tidak ada, cek folder{" "}
                <strong className="text-ink">Spam</strong> atau{" "}
                <strong className="text-ink">Promosi</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/track-order/${orderCode}`}
              className="group inline-flex h-14 w-full min-w-[220px] items-center justify-center gap-3 rounded-full bg-action px-8 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
            >
              <ScanSearch className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Lacak Pesanan</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex h-14 w-full min-w-[220px] items-center justify-center rounded-full border border-black/10 bg-paper px-8 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:border-action hover:text-action sm:w-auto"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>

        <p className="relative z-10 mt-10 text-[12px] text-ink/50">
          Ada kendala?{" "}
          <Link
            href="/contact"
            className="font-semibold underline transition-colors hover:text-action"
          >
            Hubungi Customer Service
          </Link>
        </p>
      </div>
    );
  }

  // ──────────────────  PENDING SCREEN (waiting for upload)  ─────────────
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-ink selection:bg-action selection:text-white md:-mt-24 md:pt-24">
      <main className="mx-auto max-w-5xl px-5 pb-24 sm:px-8 md:pb-32">
        {/* Header */}
        <section className="pt-10 text-center sm:pt-14 md:pt-16 animate-floatIn">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-paper px-5 py-2 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-action" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-action sm:text-[11px]">
              Order Placed
            </span>
          </span>

          <h1 className="mt-6 font-bungee text-[clamp(2rem,7.5vw,4rem)] leading-[0.98] text-ink">
            Pesanan Berhasil Dibuat
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base md:text-lg">
            Satu langkah lagi! Selesaikan pembayaran dan unggah buktinya agar
            kami dapat segera memproses pesanan handmade Anda.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => copyCode(orderCode)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-paper px-5 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-action hover:text-action"
            >
              <span className="text-ink-soft">Kode:</span>
              <span className="break-all">{orderCode}</span>
              {copied ? (
                <BadgeCheck className="h-4 w-4 text-sage" />
              ) : (
                <Copy className="h-4 w-4 opacity-40" />
              )}
            </button>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-paper px-5 py-2 text-sm font-medium text-ink-soft shadow-sm">
              {formattedDate}
            </span>
          </div>
        </section>

        {/* Payment + Summary */}
        <div className="mt-12 grid grid-cols-1 items-start gap-6 md:mt-16 md:gap-8 lg:grid-cols-2">
          {/* Payment & Upload */}
          <section
            id="upload-section"
            className="rounded-[40px] border border-black/5 bg-paper p-6 sm:p-8 md:p-10"
          >
            <h2 className="font-serif text-xl font-bold tracking-tight text-ink">
              Pembayaran
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Transfer ke rekening berikut, lalu unggah bukti transfernya.
            </p>

            <div className="relative mt-6 overflow-hidden rounded-[24px] border border-black/5 bg-canvas-oat p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-action/10" />
              <div className="relative z-10 mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-widest text-action">
                  Bank {bankSettings.bank_name}
                </span>
                <button
                  onClick={() => copyCode(bankSettings.bank_account_number)}
                  aria-label="Salin nomor rekening"
                  className="text-ink-soft transition-colors hover:text-action"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              <p className="relative z-10 mb-2 break-all text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {bankSettings.bank_account_number.replace(
                  /(\d{3})(\d{3})(\d{4})/,
                  "$1 $2 $3",
                )}
              </p>
              <p className="relative z-10 text-sm font-semibold text-ink-soft">
                a/n {bankSettings.bank_account_name}
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {showEmailInput && (
                <div className="space-y-2">
                  <label className="px-1 text-[12px] font-semibold uppercase tracking-widest text-ink-soft">
                    Email Verifikasi
                  </label>
                  <input
                    type="email"
                    value={emailForVerification}
                    onChange={(e) => setEmailForVerification(e.target.value)}
                    placeholder="Email yang Anda gunakan saat memesan"
                    className="h-14 w-full rounded-2xl border border-black/10 bg-paper px-5 text-base text-ink shadow-sm outline-none transition-all placeholder:text-ink/40 focus:border-action focus:ring-4 focus:ring-action/15"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="px-1 text-[12px] font-semibold uppercase tracking-widest text-ink-soft">
                  Bukti Transfer
                </label>
                <label className="group block cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-black/15 bg-canvas-oat/50 p-8 text-center transition-all group-hover:border-action">
                    {imagePreview ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-md">
                        <Image
                          src={imagePreview}
                          alt="Preview bukti transfer"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="text-sm font-semibold uppercase tracking-widest text-white">
                            Ganti Gambar
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-paper text-action shadow-sm transition-transform group-hover:scale-110">
                          <ImageUp className="h-8 w-8" />
                        </div>
                        <p className="mb-1 text-[15px] font-bold text-ink">
                          Klik untuk pilih file
                        </p>
                        <p className="text-[13px] text-ink-soft">
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
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-action text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Bukti Pembayaran</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Order Summary */}
          <section className="flex flex-col overflow-hidden rounded-[40px] border border-black/5 bg-paper">
            <div className="flex-1 space-y-6 p-6 sm:p-8 md:p-10">
              <h2 className="font-serif text-xl font-bold tracking-tight text-ink">
                Ringkasan Pesanan
              </h2>

              <div className="flex justify-between gap-6">
                <div className="min-w-0">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-action">
                    Pelanggan
                  </p>
                  <p className="truncate text-lg font-bold text-ink">
                    {orderData?.customerName || "..."}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Metode Bayar
                  </p>
                  <p className="text-sm font-bold text-ink">Transfer Bank</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Alamat Pengiriman
                </p>
                <p className="line-clamp-3 text-sm leading-relaxed text-ink">
                  {orderData?.shippingAddress || "..."}
                </p>
              </div>

              <div className="space-y-3 border-t border-black/5 pt-6">
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <span>Subtotal Produk</span>
                  <span>{formatCurrency(subtotalValue)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex items-center justify-between text-sm font-semibold text-sage">
                    <span>
                      Diskon
                      {couponCodeParam ? ` (${couponCodeParam})` : ""}
                    </span>
                    <span>-{formatCurrency(discountValue)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <span>Ongkos Kirim</span>
                  <span>
                    {shippingCostValue === 0
                      ? "Gratis"
                      : formatCurrency(shippingCostValue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between bg-ink px-6 py-7 text-white sm:px-8 md:px-10">
              <span className="text-base font-semibold text-white/80">
                Total Tagihan
              </span>
              <span className="text-3xl font-bold tracking-tight text-action sm:text-4xl">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </section>
        </div>

        {/* Email note */}
        <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-action/20 bg-paper p-6 md:mt-8">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-action" />
          <p className="text-sm leading-relaxed text-ink-soft">
            Detail pembayaran dan pesanan telah kami kirim ke email Anda. Cek
            folder <strong className="text-ink">Spam</strong> jika email
            konfirmasi tidak muncul di inbox.
          </p>
        </div>

        <footer className="mt-16 border-t border-black/5 pt-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
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
        <div className="-mt-20 flex min-h-screen items-center justify-center bg-canvas-oat text-action md:-mt-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
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
