import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { db } from "@/lib/db";
import { publicWhere } from "@/server/queries/public";
// Query published content at request time, not in the isolated build container.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const [areas, projects] = await Promise.all([
    db.area.findMany({ where: { isActive: true }, select: { slug: true } }),
    db.project.findMany({
      where: publicWhere,
      select: { slug: true, updatedAt: true },
    }),
  ]);
  return [
    { url: base },
    { url: `${base}/servicios` },
    { url: `${base}/empresa` },
    { url: `${base}/contactanos` },
    { url: `${base}/aviso` },
    ...areas.map((a) => ({ url: `${base}/${a.slug}` })),
    ...projects.map((p) => ({
      url: `${base}/proyectos/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
