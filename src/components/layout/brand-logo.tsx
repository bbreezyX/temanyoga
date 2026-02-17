"use client";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function BrandLogo({ size = 48, className = "", showText = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Definitions for textures and gradients */}
          <defs>
            <pattern id="knitPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M5 2C3.5 1 2 2 2 4C2 6 3.5 7 5 8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
              <path d="M5 2C6.5 1 8 2 8 4C8 6 6.5 7 5 8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
            </pattern>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Soft Glow */}
          <circle cx="100" cy="100" r="70" fill="url(#knitPattern)" className="text-primary/5" />

          {/* Woven Strands - Form Lotus Shape */}
          
          {/* Strand 1: Terracotta (Bottom/Base - Legs) */}
          <path
            d="M50 140C50 160 80 175 100 175C120 175 150 160 150 140C150 120 130 110 100 110C70 110 50 120 50 140Z"
            stroke="#c85a2d"
            strokeWidth="12"
            strokeLinecap="round"
            className="drop-shadow-sm"
          />
          
          {/* Strand 2: Sage Green (Middle/Arms) */}
          <path
            d="M40 100C30 80 50 40 100 40C150 40 170 80 160 100"
            stroke="#8a9a5b"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="2 3" /* Gives a bit of knit texture look */
          />
          <path
             d="M40 100C30 80 50 40 100 40C150 40 170 80 160 100"
             stroke="#8a9a5b"
             strokeWidth="10"
             strokeLinecap="round"
             className="opacity-40"
          />

          {/* Strand 3: Indigo (Head & Inner Flow) */}
          <circle cx="100" cy="70" r="18" stroke="#4a6fa5" strokeWidth="10" />
          
          {/* Strand 4: Mustard (Energy/Core Connection) */}
          <path
            d="M100 90V130"
            stroke="#d4a373"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Weaving Detailing - Adding "loop" texture to paths */}
          {/* Overlapping bits to simulate weaving */}
          <path
            d="M85 110C95 105 105 105 115 110"
            stroke="#c85a2d"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span className="font-display text-xl font-medium tracking-tight text-foreground whitespace-nowrap">
          dTeman <span className="font-black text-[#c85a2d]">Yoga</span>
        </span>
      )}
    </div>
  );
}
