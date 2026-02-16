"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { CreateOrderResponse } from "@/types/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const orderPlaced = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const customerName = (form.get("customerName") as string).trim();
    const customerEmail = (form.get("customerEmail") as string).trim();
    const customerPhone = (form.get("customerPhone") as string).trim();
    const shippingAddress = (form.get("shippingAddress") as string).trim();
    const notes = (form.get("notes") as string).trim();

    const newErrors: Record<string, string> = {};
    if (!customerName) newErrors.customerName = "Nama wajib diisi";
    if (!customerEmail) newErrors.customerEmail = "Email wajib diisi";
    if (!customerPhone) newErrors.customerPhone = "No. HP wajib diisi";
    if (!shippingAddress)
      newErrors.shippingAddress = "Alamat pengiriman wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const res = await apiPost<CreateOrderResponse>("/api/orders", {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    setLoading(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    orderPlaced.current = true;
    clearCart();
    router.push(
      `/checkout/success?code=${res.data.orderCode}&total=${res.data.totalAmount}`
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pemesan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Nama Lengkap</Label>
              <Input id="customerName" name="customerName" />
              {errors.customerName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" />
              {errors.customerEmail && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customerEmail}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customerPhone">No. HP / WhatsApp</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" />
              {errors.customerPhone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customerPhone}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingAddress">Alamat Pengiriman</Label>
              <Textarea id="shippingAddress" name="shippingAddress" rows={3} />
              {errors.shippingAddress && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingAddress}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </form>
    </div>
  );
}
