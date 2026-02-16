"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") ?? "";
  const total = Number(searchParams.get("total") ?? 0);

  function copyCode() {
    navigator.clipboard.writeText(orderCode);
    toast.success("Kode pesanan disalin!");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
      <h1 className="text-2xl font-bold mt-4">Pesanan Berhasil Dibuat!</h1>
      <p className="text-muted-foreground mt-2">
        Terima kasih atas pesanan Anda. Silakan lakukan pembayaran sesuai
        instruksi di bawah.
      </p>

      <Card className="mt-8 text-left">
        <CardHeader>
          <CardTitle>Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Kode Pesanan</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono font-bold text-lg">{orderCode}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Pembayaran</p>
            <p className="font-bold text-lg">{formatCurrency(total)}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold mb-2">Instruksi Pembayaran</p>
            <div className="bg-muted rounded-md p-4 text-sm space-y-2">
              <p>Transfer ke rekening berikut:</p>
              <p className="font-mono font-semibold">BCA - 1234567890</p>
              <p className="font-mono font-semibold">a.n. Temanyoga</p>
              <p className="mt-2 text-muted-foreground">
                Setelah transfer, unggah bukti pembayaran melalui halaman cek
                pesanan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button asChild className="flex-1">
          <Link href={`/track-order?code=${orderCode}`}>
            Upload Bukti Pembayaran
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/products">Lanjut Belanja</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto mt-4" />
          <Skeleton className="h-64 w-full mt-8" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
