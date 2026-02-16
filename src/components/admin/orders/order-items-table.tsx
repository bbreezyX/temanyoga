import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AdminOrderDetailItem } from "@/types/api";

export function OrderItemsTable({
  items,
  totalAmount,
}: {
  items: AdminOrderDetailItem[];
  totalAmount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="text-right">Harga Satuan</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.productNameSnapshot}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPriceSnapshot)}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPriceSnapshot * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(totalAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
