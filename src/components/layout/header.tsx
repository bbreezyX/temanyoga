import Link from "next/link";
import { BrandLogoMark } from "@/components/layout/brand-logo-mark";
import { HeaderActions } from "@/components/layout/header-actions";

export function Header() {
  return (
    <HeaderActions
      brand={
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 outline-none"
        >
          <BrandLogoMark size={44} idPrefix="header" />
          <span className="hidden font-display text-lg tracking-tight text-[#2d241c] sm:inline md:text-xl">
            D`TEMAN <span className="text-[#c85a2d]">YOGA</span>
          </span>
        </Link>
      }
      mobileBrand={
        <div className="flex items-center gap-3">
          <div className="relative flex rotate-3 items-center justify-center transition-transform hover:rotate-6">
            <BrandLogoMark size={64} idPrefix="header-mobile" />
          </div>
          <span className="font-display text-2xl font-medium tracking-tighter">
            dTeman <span className="font-black text-[#c85a2d]">Yoga</span>
          </span>
        </div>
      }
    />
  );
}
