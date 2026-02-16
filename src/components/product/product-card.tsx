import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import type { ProductListItem } from "@/types/api";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];
  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
        <div className="relative aspect-square bg-muted">
          {image ? (
            <Image
              src={getImageUrl(image.url)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Tidak ada gambar
            </div>
          )}
          {outOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Habis
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>
          <p className="mt-1 font-semibold text-base">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
