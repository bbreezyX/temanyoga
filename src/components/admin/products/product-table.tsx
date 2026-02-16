"use client";

import Image from "next/image";
import { MoreHorizontal, Pencil, ImagePlus, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { apiPatch } from "@/lib/api-client";
import { ImageUpload } from "./image-upload";
import type { AdminProductListItem } from "@/types/api";
import { useState } from "react";

interface ProductTableProps {
  products: AdminProductListItem[];
  onEdit: (product: AdminProductListItem) => void;
  onRefresh: () => void;
}

export function ProductTable({
  products,
  onEdit,
  onRefresh,
}: ProductTableProps) {
  const [imageDialogProduct, setImageDialogProduct] =
    useState<AdminProductListItem | null>(null);

  async function toggleActive(product: AdminProductListItem) {
    const res = await apiPatch(`/api/admin/products/${product.id}`, {
      isActive: !product.isActive,
    });
    if (!res.success) {
      toast.error((res as { error: string }).error);
      return;
    }
    toast.success(
      product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan"
    );
    onRefresh();
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-center">Stok</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Terjual</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded border">
                      {product.images[0] ? (
                        <Image
                          src={getImageUrl(product.images[0].url)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted text-[8px] text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.stock ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                    >
                      {product.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {product._count.orderItems}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setImageDialogProduct(product)}
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          Upload Gambar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(product)}>
                          {product.isActive ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Aktifkan
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!imageDialogProduct}
        onOpenChange={(v) => !v && setImageDialogProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload Gambar — {imageDialogProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {imageDialogProduct && (
            <div className="space-y-4">
              {imageDialogProduct.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imageDialogProduct.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-16 w-16 overflow-hidden rounded border"
                    >
                      <Image
                        src={getImageUrl(img.url)}
                        alt="Product"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
              <ImageUpload
                productId={imageDialogProduct.id}
                onUploaded={() => {
                  setImageDialogProduct(null);
                  onRefresh();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
