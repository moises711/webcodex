import { serviceLandings } from "@/lib/service-landings";
import type { MetadataRoute } from "next";
import { portalAreas } from "@/lib/areas";
import { siteUrl } from "@/lib/seo";
import { db } from "@/lib/db";
import { publicWhere } from "@/server/queries/public";
// Query published content at request time, not in the isolated build container.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const [areas, projects] = await Promise.all([
    db.area.findMany({
      where: {
        isActive: true,
        slug: { in: portalAreas.map((area) => area.slug) },
      },
      select: { slug: true },
    }),
    db.project.findMany({
      where: publicWhere,
      select: { slug: true, updatedAt: true },
    }),
  ]);
  const entries: MetadataRoute.Sitemap = [
    { url: base },
    { url: `${base}/servicios` },
    ...serviceLandings.map((page) => ({ url: `${base}/${page.slug}` })),
    { url: `${base}/empresa` },
    { url: `${base}/contactanos` },
    { url: `${base}/aviso` },
    ...areas.map((a) => ({ url: `${base}/${a.slug}` })),
    ...projects.map((p) => ({
      url: `${base}/proyectos/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
  return entries.filter(
    (entry, index) =>
      entries.findIndex((other) => other.url === entry.url) === index,
  );
}
