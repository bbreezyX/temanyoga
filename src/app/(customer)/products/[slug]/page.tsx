import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { prisma } from "@/lib/prisma";
import type { ProductDetail as ProductDetailType } from "@/types/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => ({ slug: product.slug }));
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!product) return null;
  return JSON.parse(JSON.stringify(product)) as ProductDetailType;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <main className="bg-[#f5f1ed] min-h-screen">
      <ProductDetail product={product} />
    </main>
  );
}
