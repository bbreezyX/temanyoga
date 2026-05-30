import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
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

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    select: { rating: true, comment: true, customerName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10,
        ) / 10
      : 0;

  // Google requires aggregateRating/review only when real ratings exist —
  // these are verified-purchase reviews (gated to completed orders).
  const reviewNodes = reviews
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .slice(0, 5)
    .map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: r.customerName },
      datePublished: r.createdAt.toISOString().split("T")[0],
      reviewBody: r.comment,
    }));

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: productUrl,
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: "D`TEMAN YOGA",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "IDR",
      price: Number(product.price),
      priceValidUntil,
      availability:
        product.stock === null || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "D`TEMAN YOGA",
      },
    },
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviewNodes.length > 0 && { review: reviewNodes }),
    material: "Benang katun susu (milk cotton)",
    category: "Boneka Rajut Yoga",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Koleksi",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        // escape `<` → < so customer-submitted review text can't break out of the tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={product} />
    </main>
  );
}
