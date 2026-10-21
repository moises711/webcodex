import { pageMetadata, siteUrl } from "./seo";
type PublicProject = {
  slug: string;
  title: string;
  summary: string;
  type: string;
  area: { name: string; slug: string };
  cover: { url: string; alt: string } | null;
  updatedAt: Date | string;
  system: { systemName: string; url: string } | null;
};
export function projectMetadata(project: PublicProject) {
  const kind =
    project.type === "SYSTEM"
      ? "Sistema de gestión"
      : project.type === "WEBSITE"
        ? "Página web"
        : "Proyecto";
  const title = `${project.title} | ${kind} en Cusco`;
  const metadata = pageMetadata(
    title,
    project.summary,
    `/proyectos/${project.slug}`,
  );
  const images = project.cover
    ? [
        {
          url: new URL(project.cover.url, `${siteUrl}/`).href,
          alt: project.cover.alt,
        },
      ]
    : undefined;
  return {
    ...metadata,
    robots: { index: true, follow: true },
    openGraph: { ...metadata.openGraph, ...(images ? { images } : {}) },
    twitter: { ...metadata.twitter, ...(images ? { images } : {}) },
  };
}
export function projectStructuredData(project: PublicProject) {
  const url = `${siteUrl}/proyectos/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: project.title,
        description: project.summary,
        inLanguage: "es-PE",
        dateModified: new Date(project.updatedAt).toISOString(),
        breadcrumb: { "@id": `${url}#breadcrumbs` },
        mainEntity: { "@id": `${url}#work` },
      },
      {
        "@type":
          project.type === "SYSTEM" ? "SoftwareApplication" : "CreativeWork",
        "@id": `${url}#work`,
        name: project.title,
        description: project.summary,
        url,
        ...(project.cover
          ? { image: new URL(project.cover.url, `${siteUrl}/`).href }
          : {}),
        ...(project.type === "SYSTEM"
          ? {
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web browser",
            }
          : {}),
        creator: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: project.area.name,
            item: `${siteUrl}/${project.area.slug}`,
          },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
