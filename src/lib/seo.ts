import type { Metadata } from "next";
// Keep public identity stable even when Hostinger builds on a temporary hostname.
export const siteUrl = "https://codexcusco.com";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  keywords?: string,
): Metadata {
  const brandedTitle = title.includes("Códex Cusco")
    ? title
    : `${title} | Códex Cusco`;
  const images = [
    {
      url: `${siteUrl}/resources/images/codex-cusco.jpeg`,
      alt: "Códex Cusco: soluciones tecnológicas en Cusco, Perú",
    },
  ];
  return {
    title: title.includes("Códex Cusco") ? { absolute: title } : title,
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
      title: brandedTitle,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Códex Cusco",
      locale: "es_PE",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images,
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
