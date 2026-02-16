import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOrderDetail } from "@/types/api";

export function OrderDetailCard({ order }: { order: AdminOrderDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pelanggan</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Nama</p>
          <p className="font-medium">{order.customerName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{order.customerEmail}</p>
        </div>
        <div>
          <p className="text-muted-foreground">No. HP</p>
          <p className="font-medium">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Alamat Pengiriman</p>
          <p className="font-medium whitespace-pre-wrap">{order.shippingAddress}</p>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Catatan</p>
            <p className="font-medium">{order.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
