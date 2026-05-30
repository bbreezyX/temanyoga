import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductReviewsSection } from "@/components/review/product-reviews-section";
import { getProductBySlug } from "@/lib/product-queries";
import { getActiveAccessories } from "@/lib/accessory-queries";
import { getProductReviews } from "@/lib/review-queries";
import { SITE_URL } from "@/lib/site-url";
import { getAbsoluteImageUrl } from "@/lib/image-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { prisma } = await import("@/lib/prisma");
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [accessories, reviewData] = await Promise.all([
    getActiveAccessories(),
    getProductReviews(product.id),
  ]);

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const { reviews, averageRating, totalReviews } = reviewData;

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
      datePublished: r.createdAt.split("T")[0],
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
    image: product.images.map((img) => getAbsoluteImageUrl(img.url)),
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
      <Suspense>
        <ProductDetail
          product={product}
          accessories={accessories}
          reviewSummary={{ averageRating, totalReviews }}
        >
          <ProductReviewsSection {...reviewData} />
        </ProductDetail>
      </Suspense>
    </main>
  );
}
