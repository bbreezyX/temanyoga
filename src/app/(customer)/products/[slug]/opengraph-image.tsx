import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/image-url";
import { formatCurrency } from "@/lib/utils";

export const runtime = "nodejs"; // Prisma requires Node.js runtime unless using edge client

export const alt = "D`TEMAN YOGA Product Detail";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  // Fallback if product not found
  if (!product) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f1ed",
          fontSize: 48,
          color: "#c85a2d",
        }}
      >
        Product Not Found
      </div>,
      { ...size },
    );
  }

  // Fetch font
  const manropeBold = await fetch(
    new URL(
      "https://fonts.gstatic.com/s/manrope/v14/xn7_YHE41ni1AdIRqAuZuw1x.woff2",
      import.meta.url,
    ),
  )
    .then((res) => res.arrayBuffer())
    .catch(() => null);

  const productImage = product.images[0]?.url
    ? getImageUrl(product.images[0].url)
    : null;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f5f1ed",
        fontFamily: "Manrope",
      }}
    >
      {/* Left Side: Product Info */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#c85a2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              color: "white",
              fontSize: "20px",
              fontWeight: 900,
            }}
          >
            D
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#1a1a1a",
            }}
          >
            D&apos;TEMAN <span style={{ color: "#c85a2d" }}>YOGA</span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#1a1a1a",
            margin: "0 0 20px 0",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h1>

        {/* Price Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fdf8f6",
              border: "2px solid rgba(200, 90, 45, 0.1)",
              borderRadius: "100px",
              padding: "12px 32px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#c85a2d",
              }}
            >
              {formatCurrency(Number(product.price))}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#c85a2d",
            }}
          />
          <span style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
            Unik & Handmade
          </span>
        </div>
      </div>

      {/* Right Side: Image */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f1ed",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(200, 90, 45, 0.1) 0%, transparent 70%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={productImage}
            alt={product.name}
            width="600"
            height="630"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: "80px",
              color: "#e8dcc8",
            }}
          >
            🧘‍♀️
          </div>
        )}
        {/* Gradient Overlay for integration */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "100px",
            backgroundImage: "linear-gradient(to right, #ffffff, transparent)",
          }}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: manropeBold
        ? [
            {
              name: "Manrope",
              data: manropeBold,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    },
  );
}
