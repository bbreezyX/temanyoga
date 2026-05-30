import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export function createInfoPageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title: `${title} | D'TEMAN YOGA`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      url,
      title: `${title} | D'TEMAN YOGA`,
      description,
    },
  };
}
