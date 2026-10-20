import type { Metadata } from "next";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  "https://codexcusco.com"
).replace(/\/$/, "");
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  keywords?: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    ...(keywords
      ? {
          keywords: keywords
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean),
        }
      : {}),
    openGraph: {
      title: `${title} | Códex Cusco`,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Códex Cusco",
      locale: "es_PE",
      type: "website",
      images: ["/resources/images/codex-cusco.jpeg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/resources/images/codex-cusco.jpeg"],
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
