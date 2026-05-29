import type { CSSProperties } from "react";
import type { Dimensions } from "../lib/sizes";
import type { PosterData } from "../lib/types";

interface Props {
  data: PosterData;
  dims: Dimensions;
  backgroundDataUri: string | null;
}

/**
 * A single promo-poster layout. All sizing is in `mm` and scaled by `k` so the
 * same template holds its proportions across A3 and A2. Text lives inside the
 * safe area (`contentInset`); the background bleeds to the full page edge.
 */
export function PromoPoster({ data, dims, backgroundDataUri }: Props) {
  const accent = data.accent ?? "#E08D5A";
  // Scale factor relative to A3-portrait full width (303mm) so type scales with paper.
  const k = dims.full.w / 303;
  const mm = (n: number) => `${n * k}mm`;

  const root: CSSProperties = {
    position: "relative",
    width: `${dims.full.w}mm`,
    height: `${dims.full.h}mm`,
    overflow: "hidden",
    color: "#fff",
    background: backgroundDataUri
      ? "#23302a"
      : "linear-gradient(160deg,#5b6b5a 0%,#3c4a3e 45%,#23302a 100%)",
  };

  const bg: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("${backgroundDataUri}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const scrim: CSSProperties = {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.78) 100%)",
  };

  const content: CSSProperties = {
    position: "absolute",
    inset: `${dims.contentInset}mm`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  return (
    <div style={root}>
      {backgroundDataUri && <div style={bg} />}
      <div style={scrim} />
      <div style={content}>
        <div>
          {data.eyebrow && (
            <div
              style={{
                fontSize: mm(4),
                letterSpacing: mm(1),
                textTransform: "uppercase",
                fontWeight: 600,
                color: accent,
              }}
            >
              {data.eyebrow}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: mm(6) }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: mm(18),
                lineHeight: 1.02,
                fontWeight: 800,
                textShadow: "0 1px 8px rgba(0,0,0,0.35)",
              }}
            >
              {data.title}
            </h1>
            {data.subtitle && (
              <p
                style={{
                  margin: `${mm(3)} 0 0`,
                  fontSize: mm(5.5),
                  fontWeight: 400,
                  maxWidth: "82%",
                  opacity: 0.95,
                }}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          {data.details && data.details.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: mm(10) }}>
              {data.details.map((d) => (
                <div key={`${d.label}-${d.value}`}>
                  <div
                    style={{
                      fontSize: mm(3.2),
                      letterSpacing: mm(0.6),
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: accent,
                    }}
                  >
                    {d.label}
                  </div>
                  <div style={{ fontSize: mm(5), fontWeight: 500, marginTop: mm(1) }}>
                    {d.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: mm(2),
            }}
          >
            {data.cta && (
              <span
                style={{
                  background: accent,
                  color: "#1a1a1a",
                  fontWeight: 600,
                  fontSize: mm(4.5),
                  padding: `${mm(3)} ${mm(6)}`,
                  borderRadius: mm(20),
                }}
              >
                {data.cta}
              </span>
            )}
            {data.footer && (
              <span style={{ fontSize: mm(4), fontWeight: 500, opacity: 0.9 }}>
                {data.footer}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
