import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { prisma } from "@/lib/prisma";

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: { orderBy: { order: "asc" } } },
    });
    return products;
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Gantungan Kunci Handmade
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Koleksi gantungan kunci unik buatan tangan. Cocok untuk souvenir,
            hadiah, atau koleksi pribadi.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">Lihat Semua Produk</Link>
          </Button>
        </div>
      </section>

      {products.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Produk Terbaru</h2>
            <Button variant="ghost" asChild>
              <Link href="/products">Lihat Semua</Link>
            </Button>
          </div>
          <ProductGrid products={products as any} />
        </section>
      )}
    </>
  );
}
