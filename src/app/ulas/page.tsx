"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReviewForm } from "@/components/review/review-form";
import { ArrowLeft, CheckCircle, Package } from "lucide-react";
import type { VerifyOrderResponse, ReviewableItem } from "@/types/api";

export default function UlasPage() {
  const [step, setStep] = useState<"verify" | "select" | "review" | "success">(
    "verify",
  );
  const [orderCode, setOrderCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<VerifyOrderResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch("/api/reviews/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, email }),
      });

      const data = await res.json();

      if (!data.success) {
        setVerifyError(data.error);
        return;
      }

      const itemsNeedingReview = data.data.items.filter(
        (item: ReviewableItem) => !item.hasReview,
      );

      if (itemsNeedingReview.length === 0) {
        setVerifyError("Semua produk di order ini sudah diulas");
        return;
      }

      setOrderData({ ...data.data, items: itemsNeedingReview });
      setStep("select");
    } catch {
      setVerifyError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSubmitReview(
    orderItemId: string,
    rating: number,
    comment: string,
  ) {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderItemId, rating, comment, email }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    setStep("success");
  }

  function handleSelectItem(item: ReviewableItem) {
    setSelectedItem(item);
    setStep("review");
  }

  function handleReviewSuccess() {
    setStep("success");
  }

  function handleStartOver() {
    setStep("verify");
    setOrderCode("");
    setEmail("");
    setOrderData(null);
    setSelectedItem(null);
    setVerifyError(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f1ed] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 ring-1 ring-slate-100">
          {step === "verify" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#7a9d7f]/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-[#7a9d7f]" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Beri Ulasan
                </h1>
                <p className="text-slate-600">
                  Masukkan kode order dan email untuk verifikasi
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Kode Order
                  </label>
                  <Input
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: TY-XXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    required
                  />
                </div>

                {verifyError && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {verifyError}
                  </p>
                )}

                <Button type="submit" disabled={isVerifying} className="w-full">
                  {isVerifying ? "Memverifikasi..." : "Verifikasi Order"}
                </Button>
              </form>
            </>
          )}

          {step === "select" && orderData && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Pilih Produk
                </h2>
                <p className="text-sm text-slate-600">
                  Order #{orderData.orderCode} - {orderData.customerName}
                </p>
              </div>

              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <button
                    key={item.orderItemId}
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#c85a2d] hover:bg-[#fdf8f6] transition-all"
                  >
                    <p className="font-medium text-slate-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-slate-500">
                      Jumlah: {item.quantity}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartOver}
                className="w-full mt-4 text-sm text-slate-600 hover:text-slate-900"
              >
                Gunakan order lain
              </button>
            </>
          )}

          {step === "review" && selectedItem && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setStep("select")}
                  className="text-sm text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Pilih produk lain
                </button>
                <h2 className="text-xl font-bold text-slate-900">
                  Tulis Ulasan
                </h2>
              </div>

              <ReviewForm
                orderItemId={selectedItem.orderItemId}
                productName={selectedItem.productName}
                onSubmit={handleSubmitReview}
                onSuccess={handleReviewSuccess}
              />
            </>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#7a9d7f]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#7a9d7f]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Terima Kasih!
              </h2>
              <p className="text-slate-600 mb-6">
                Ulasan Anda telah berhasil dikirim
              </p>
              <div className="space-y-3">
                {selectedItem && (
                  <Link
                    href={`/products/${selectedItem.productSlug}`}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Lihat Produk
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleStartOver}
                  variant="ghost"
                  className="w-full"
                >
                  Tulis Ulasan Lain
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
