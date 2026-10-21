import { siteUrl } from "./seo";
export type Breadcrumb = { name: string; href: string };
export function businessStructuredData() {
  return { "@context": "https://schema.org", "@type": "ProfessionalService",
    "@id": `${siteUrl}/#organization`, name: "Códex Cusco", alternateName: "Codex Cusco",
    description: "Páginas web, desarrollo de software, marketing digital, ciberseguridad y soporte técnico en Cusco, Perú.",
    url: siteUrl, logo: `${siteUrl}/resources/images/codex-cusco-logo.png`,
    image: `${siteUrl}/resources/images/codex-cusco.jpeg`, telephone: "+51957258762", email: "codexcusco@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: "Cusco", addressRegion: "Cusco", addressCountry: "PE" },
    areaServed: { "@type": "City", name: "Cusco" },
    sameAs: ["https://www.facebook.com/share/19a2DKsK4Z/", "https://instagram.com/cuscocodex"] };
}
export function breadcrumbStructuredData(items: Breadcrumb[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.href, siteUrl).href })) };
}
