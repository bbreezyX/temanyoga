import { cn } from "@/lib/utils";

interface BrandLogoMarkProps {
  size?: number;
  className?: string;
  /** Unique prefix for SVG defs when multiple marks appear on one page. */
  idPrefix?: string;
}

/** Inline brand mark — Server Component safe (footer, header shell). */
export function BrandLogoMark({
  size = 48,
  className = "",
  idPrefix = "brand",
}: BrandLogoMarkProps) {
  const patternId = `${idPrefix}-knitPattern`;

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M5 2C3.5 1 2 2 2 4C2 6 3.5 7 5 8"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.2"
              fill="none"
            />
            <path
              d="M5 2C6.5 1 8 2 8 4C8 6 6.5 7 5 8"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.2"
              fill="none"
            />
          </pattern>
        </defs>

        <circle
          cx="100"
          cy="100"
          r="70"
          fill={`url(#${patternId})`}
          className="text-primary/5"
        />

        <path
          d="M50 140C50 160 80 175 100 175C120 175 150 160 150 140C150 120 130 110 100 110C70 110 50 120 50 140Z"
          stroke="#c85a2d"
          strokeWidth="12"
          strokeLinecap="round"
          className="drop-shadow-sm"
        />
        <path
          d="M40 100C30 80 50 40 100 40C150 40 170 80 160 100"
          stroke="#8a9a5b"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
        <path
          d="M40 100C30 80 50 40 100 40C150 40 170 80 160 100"
          stroke="#8a9a5b"
          strokeWidth="10"
          strokeLinecap="round"
          className="opacity-40"
        />
        <circle cx="100" cy="70" r="18" stroke="#4a6fa5" strokeWidth="10" />
        <path
          d="M100 90V130"
          stroke="#d4a373"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M85 110C95 105 105 105 115 110"
          stroke="#c85a2d"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
