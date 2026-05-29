import type { CSSProperties } from "react";
import type { Dimensions } from "../lib/sizes";
import type { CatalogData } from "../lib/types";

interface Props {
  data: CatalogData;
  dims: Dimensions;
  /** Map of `item.photo` → data URI (or null if the file is missing). */
  photos: Record<string, string | null>;
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * A print catalog: header, a grid of item cards (photo + name + price +
 * 2-line description), and a footer. Sizing is in `mm`, scaled by `k` so it
 * holds proportions across A3/A2. Rows are equal height (`gridAutoRows: 1fr`)
 * so the grid fills the page regardless of item count.
 */
export function CatalogPoster({ data, dims, photos }: Props) {
  const accent = data.accent ?? "#C2703D";
  const columns = data.columns ?? 2;
  const k = dims.full.w / 303;
  const mm = (n: number) => `${n * k}mm`;

  const ink = "#2A2A28";
  const muted = "#8A847A";
  const hairline = "rgba(0,0,0,0.12)";

  const root: CSSProperties = {
    position: "relative",
    width: `${dims.full.w}mm`,
    height: `${dims.full.h}mm`,
    background: "#FAF7F2",
    color: ink,
    fontFamily: '"Inter", system-ui, sans-serif',
  };

  const frame: CSSProperties = {
    position: "absolute",
    inset: `${dims.contentInset}mm`,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={root}>
      <div style={frame}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingBottom: mm(4),
            borderBottom: `${mm(0.4)} solid ${hairline}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: mm(11),
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {data.title}
          </h1>
          {data.subtitle && (
            <span
              style={{
                fontSize: mm(3.4),
                letterSpacing: mm(0.5),
                textTransform: "uppercase",
                color: muted,
                fontWeight: 600,
              }}
            >
              {data.subtitle}
            </span>
          )}
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: "1fr",
            gap: mm(8),
            padding: `${mm(7)} 0`,
          }}
        >
          {data.items.map((item, i) => {
            const src = photos[item.photo];
            return (
              <article
                key={`${item.name}-${i}`}
                style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
              >
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: mm(2.5),
                    overflow: "hidden",
                    background: "#ECE7DE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span
                      style={{
                        color: muted,
                        fontSize: mm(3),
                        padding: mm(4),
                        textAlign: "center",
                      }}
                    >
                      {item.photo}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: mm(2.5) }}>
                  <div
                    style={{
                      fontSize: mm(4.2),
                      fontWeight: 600,
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: mm(4.4),
                      fontWeight: 700,
                      color: accent,
                      marginTop: mm(0.8),
                    }}
                  >
                    {rupiah(item.price)}
                  </div>
                  {/* Always reserve 2 lines so every card's text block is the
                      same height — keeps the flex-filled images aligned. */}
                  <p
                    style={{
                      margin: `${mm(1.4)} 0 0`,
                      height: mm(3.2 * 1.3 * 2),
                      fontSize: mm(3.2),
                      lineHeight: 1.3,
                      color: muted,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.description ?? ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {(data.footer || data.note) && (
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: mm(4),
              borderTop: `${mm(0.4)} solid ${hairline}`,
              fontSize: mm(3.4),
              color: muted,
            }}
          >
            <span style={{ fontWeight: 600, color: ink }}>{data.footer}</span>
            <span>{data.note}</span>
          </footer>
        )}
      </div>
    </div>
  );
}
