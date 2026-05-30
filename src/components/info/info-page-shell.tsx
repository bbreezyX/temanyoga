import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function InfoPageShell({
  eyebrow,
  title,
  description,
  backHref = "/",
  backLabel = "Kembali ke Beranda",
  children,
}: InfoPageShellProps) {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-[#2d241c] md:-mt-24 md:pt-24">
      <div className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 md:px-12">
        <section className="pt-12 md:pt-16">
          <div className="mb-10 flex flex-col gap-8 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-px w-8 bg-[#c85a2d]" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c85a2d]">
                  {eyebrow}
                </span>
              </div>
              <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-[#2d241c] md:text-5xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-4 text-base leading-7 text-[#6b5b4b] md:text-[17px]">
                  {description}
                </p>
              ) : null}
            </div>
            <Link
              href={backHref}
              className="group inline-flex items-center gap-3 self-start text-[14px] font-bold text-[#6b5b4b] transition-colors hover:text-[#c85a2d] md:self-end"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>{backLabel}</span>
            </Link>
          </div>

          <div className="space-y-6">{children}</div>
        </section>
      </div>
    </div>
  );
}

type InfoSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function InfoSection({ title, children, className }: InfoSectionProps) {
  return (
    <section
      className={`rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft md:rounded-[32px] md:p-8 ${className ?? ""}`}
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[#2d241c] md:text-[1.75rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#6b5b4b]">
        {children}
      </div>
    </section>
  );
}

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-soft open:bg-[#fbf8f4] md:p-6"
        >
          <summary className="cursor-pointer list-none font-semibold text-[#2d241c] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              <span>{item.question}</span>
              <span className="mt-1 shrink-0 text-[#c85a2d] transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="mt-4 text-[15px] leading-7 text-[#6b5b4b]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
