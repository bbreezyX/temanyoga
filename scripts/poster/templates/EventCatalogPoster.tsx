import type { CSSProperties } from "react";
import { GRAIN, fonts, palette } from "../lib/theme";
import type { Dimensions } from "../lib/sizes";
import type { EventCatalogData } from "../lib/types";

interface Props {
  data: EventCatalogData;
  dims: Dimensions;
  photos: Record<string, string | null>;
  logo: string | null;
  /** Editor mode (web): show a resize handle on the logo. */
  editable?: boolean;
}

// Design tokens come from the shared theme (lib/theme.ts). Aliased to short
// local names used throughout this template.
const { paper: PAPER, clay: CLAY, moss: MOSS, cream: CREAM, ink: INK } = palette;

export function EventCatalogPoster({ data, dims, photos, logo, editable }: Props) {
  const columns = data.columns ?? 4;
  const k = dims.full.w / 303;
  const mm = (n: number) => `${n * k}mm`;
  const logoPos = data.logoPos ?? { x: 86, y: 10 };
  const logoSize = data.logoSize ?? 30;
  const SAFE = 13;

  const root: CSSProperties = {
    position: "relative",
    width: `${dims.full.w}mm`,
    height: `${dims.full.h}mm`,
    overflow: "hidden",
    background: PAPER,
    color: INK,
    fontFamily: fonts.body,
    display: "flex",
    flexDirection: "column",
  };

  const overlay = (extra: CSSProperties): CSSProperties => ({
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 5,
    ...extra,
  });

  // small halftone dot field, used as a texture on the ink blocks
  const halftone = (dot: string): CSSProperties => ({
    backgroundImage: `radial-gradient(${dot} 26%, transparent 28%)`,
    backgroundSize: `${mm(2)} ${mm(2)}`,
  });

  const anton = (size: number): CSSProperties => ({
    fontFamily: fonts.display,
    fontWeight: 400,
    fontSize: mm(size),
    lineHeight: 0.95,
    textTransform: "uppercase",
    letterSpacing: mm(0.2),
  });

  const cropMark = (pos: CSSProperties) => (
    <svg
      width={mm(5)}
      height={mm(5)}
      viewBox="0 0 20 20"
      style={{ position: "absolute", zIndex: 6, ...pos }}
    >
      <line x1="10" y1="1" x2="10" y2="19" stroke={MOSS} strokeWidth="1" />
      <line x1="1" y1="10" x2="19" y2="10" stroke={MOSS} strokeWidth="1" />
    </svg>
  );

  const card = (item: EventCatalogData["items"][number], i: number) => {
    const src = photos[item.photo];
    const accent = i % 2 === 0 ? CLAY : MOSS;
    return (
      <div key={`${item.name}-${i}`} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          {/* offset ink block = registration / overprint depth */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${mm(1.8)}, ${mm(1.8)})`,
              background: accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: CREAM,
              border: `${mm(0.8)} solid ${INK}`,
              padding: mm(1.4),
              boxSizing: "border-box",
            }}
          >
            {src ? (
              <img src={src} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>
        </div>

        <div
          style={{
            ...anton(3.7),
            height: mm(3.7 * 0.95 * 2),
            marginTop: mm(2.2),
            color: INK,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {item.name}
        </div>
        {item.tag && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: mm(1.4) }}>
            <span
              style={{
                background: accent,
                color: CREAM,
                fontFamily: fonts.body,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: mm(0.2),
                fontSize: mm(2.4),
                lineHeight: 1.15,
                padding: `${mm(1)} ${mm(2.4)}`,
                transform: i % 2 === 0 ? "rotate(-1.6deg)" : "rotate(1.6deg)",
                textAlign: "center",
                maxWidth: "100%",
              }}
            >
              {item.tag}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={root}>
      {/* masthead — full-bleed ink block */}
      <div
        style={{
          background: MOSS,
          color: CREAM,
          padding: `${mm(SAFE * 0.7)} ${mm(SAFE)} ${mm(SAFE * 0.45)}`,
          textAlign: "center",
        }}
      >
        {data.stamp && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: mm(2.8) }}>
            {/* rubber-stamp "seal" — double rule + rotated, riso ink-stamp feel */}
            <div style={{ transform: "rotate(-2.4deg)", border: `${mm(0.5)} solid ${CREAM}`, padding: mm(0.8) }}>
              <div
                style={{
                  border: `${mm(0.4)} solid ${CREAM}`,
                  padding: `${mm(1)} ${mm(3)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: mm(2),
                }}
              >
                <span style={{ width: mm(1.4), height: mm(1.4), background: CREAM, transform: "rotate(45deg)", flex: "0 0 auto" }} />
                <span
                  style={{
                    fontFamily: fonts.body,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: mm(1.1),
                    fontSize: mm(3),
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {data.stamp}
                </span>
                <span style={{ width: mm(1.4), height: mm(1.4), background: CREAM, transform: "rotate(45deg)", flex: "0 0 auto" }} />
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: mm(1.4),
            fontSize: mm(3.4),
          }}
        >
          {data.subtitle}
        </div>
      </div>

      {/* middle — cream */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: `${mm(7)} ${mm(SAFE)} ${mm(6)}`,
        }}
      >
        {/* title with red/blue overprint offset */}
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", ...anton(30) }}>
            <span style={{ position: "absolute", left: mm(1.6), top: mm(1.6), color: MOSS, mixBlendMode: "multiply" }}>
              {data.heading}
            </span>
            <span style={{ position: "relative", color: CLAY }}>{data.heading}</span>
          </div>
          {data.tagline && (
            <div
              style={{
                marginTop: mm(2),
                fontFamily: fonts.body,
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: mm(5),
                color: CLAY,
              }}
            >
              {data.tagline}
            </div>
          )}
          {data.intro && (
            <p
              style={{
                margin: `${mm(3)} auto 0`,
                maxWidth: "84%",
                fontSize: mm(3.2),
                lineHeight: 1.45,
                fontWeight: 500,
                color: INK,
              }}
            >
              {data.intro}
            </p>
          )}
        </div>

        {/* grid */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: mm(7),
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: "1fr",
            columnGap: mm(5),
            rowGap: mm(5),
          }}
        >
          {data.items.map(card)}
        </div>
      </div>

      {/* footer — two full-bleed ink blocks */}
      <div style={{ display: "flex" }}>
        {data.details && data.details.length > 0 && (
          <div
            style={{
              flex: 1.45,
              background: MOSS,
              color: CREAM,
              padding: `${mm(SAFE * 0.7)} ${mm(SAFE)}`,
              position: "relative",
            }}
          >
            <div style={overlay({ ...halftone("rgba(255,255,255,0.12)"), zIndex: 0 })} />
            <div style={{ position: "relative" }}>
              <div style={{ ...anton(5.2), color: CREAM, marginBottom: mm(2) }}>{data.detailTitle ?? "Detail"}</div>
              {data.details.map((d) => (
                <div key={d.label} style={{ display: "flex", fontSize: mm(2.8), lineHeight: 1.4, marginBottom: mm(0.6) }}>
                  <span style={{ flex: "0 0 auto", width: mm(20), fontWeight: 700, textTransform: "uppercase", letterSpacing: mm(0.1) }}>
                    {d.label}
                  </span>
                  <span style={{ flex: 1, opacity: 0.92 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.inspiration && (
          <div
            style={{
              flex: 1,
              background: CLAY,
              color: CREAM,
              padding: `${mm(SAFE * 0.7)} ${mm(SAFE)}`,
              position: "relative",
            }}
          >
            <div style={overlay({ ...halftone("rgba(255,255,255,0.14)"), zIndex: 0 })} />
            <div style={{ position: "relative" }}>
              <div style={{ ...anton(5.2), color: CREAM, marginBottom: mm(2) }}>
                {data.inspirationTitle ?? "Inspiration"}
              </div>
              <p style={{ margin: 0, fontSize: mm(3.1), lineHeight: 1.4, fontWeight: 500, fontStyle: "italic" }}>
                {data.inspiration}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* textures + print marks */}
      <div style={overlay({ background: GRAIN, opacity: 0.1, mixBlendMode: "multiply" })} />
      {cropMark({ top: mm(5), left: mm(5) })}
      {cropMark({ top: mm(5), right: mm(5) })}
      {cropMark({ bottom: mm(5), left: mm(5) })}
      {cropMark({ bottom: mm(5), right: mm(5) })}

      {/* logo — free position & size; nothing renders when no logo */}
      {logo ? (
        <div
          data-poster-logo
          style={{
            position: "absolute",
            zIndex: 7,
            left: `${logoPos.x}%`,
            top: `${logoPos.y}%`,
            transform: "translate(-50%, -50%)",
            width: mm(logoSize),
            lineHeight: 0,
          }}
        >
          <img src={logo} alt="logo" style={{ width: "100%", height: "auto", display: "block" }} />
          {editable && (
            <span
              data-poster-logo-resize
              className="logo-handle"
              style={{
                position: "absolute",
                right: mm(-1.6),
                bottom: mm(-1.6),
                width: mm(3.4),
                height: mm(3.4),
                borderRadius: "50%",
                background: CLAY,
                border: `${mm(0.5)} solid ${CREAM}`,
                boxShadow: `0 ${mm(0.4)} ${mm(0.9)} rgba(0,0,0,0.35)`,
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
