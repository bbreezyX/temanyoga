import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { prisma } from "@/lib/prisma";
import type { ProductDetail as ProductDetailType } from "@/types/api";

const SITE_URL = "https://ditemaniyoga.com";

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

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: product.name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${SITE_URL}/products/${product.slug}`,
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: "D`TEMAN YOGA",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: Number(product.price),
      availability:
        product.stock === null || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "D`TEMAN YOGA",
      },
    },
    material: "Benang katun susu (milk cotton)",
    category: "Boneka Rajut Yoga",
  };

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </main>
  );
}
