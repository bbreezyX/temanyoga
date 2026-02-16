"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";

export function CartSummary() {
  const { cartTotal, cartCount } = useCart();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Total ({cartCount} item)
          </span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
