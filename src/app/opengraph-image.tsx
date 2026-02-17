import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "D`TEMAN YOGA - Menemani Perjalanan Yoga Anda";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // We use a simple fetch to get the font
  // In a real production env, you might want to bundle the font or use a consistent URL
  const manropeBold = await fetch(
    new URL(
      "https://fonts.gstatic.com/s/manrope/v14/xn7_YHE41ni1AdIRqAuZuw1x.woff2",
      import.meta.url,
    ),
  )
    .then((res) => res.arrayBuffer())
    .catch(() => null);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f1ed",
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(200, 90, 45, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(122, 157, 127, 0.1) 0%, transparent 50%)",
        fontFamily: "Manrope",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          border: "2px solid rgba(200, 90, 45, 0.1)",
          borderRadius: "32px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(200, 90, 45, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {/* Simple Logo Representation */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#c85a2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
              color: "white",
              fontSize: "32px",
              fontWeight: 900,
            }}
          >
            D
          </div>
          <h1
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#1a1a1a",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            D&apos;TEMAN{" "}
            <span style={{ color: "#c85a2d", marginLeft: "16px" }}>YOGA</span>
          </h1>
        </div>

        <p
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#4b5563",
            marginTop: "10px",
            marginBottom: "0",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Menemani Perjalanan Yoga Anda
        </p>

        <div
          style={{
            display: "flex",
            marginTop: "30px",
            gap: "12px",
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
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#7a9d7f",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#e8dcc8",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          fontSize: "20px",
          color: "#7a9d7f",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Handmade Crochet Products
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
