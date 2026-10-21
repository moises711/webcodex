import { portalAreas } from "@/lib/areas";
import "server-only";
import { correctPublicCopy, publicProjectCopy } from "@/lib/public-copy";
import { projectLists } from "@/lib/string-list";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
export const publicWhere: Prisma.ProjectWhereInput = {
  status: "PUBLISHED",
  area: { isActive: true },
};
const projectSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  type: true,
  workDate: true,
  year: true,
  tags: true,
  techStack: true,
  isFeatured: true,
  publishedAt: true,
  updatedAt: true,
  area: { select: { id: true, name: true, slug: true, color: true } },
  coverLinkUrl: true,
  cover: { select: { url: true, alt: true, width: true, height: true } },
} satisfies Prisma.ProjectSelect;
export const getAreas = unstable_cache(
  async () =>
    db.area.findMany({
      where: { isActive: true, slug: { in: portalAreas.map((area) => area.slug) } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        coverImageUrl: true,
        _count: { select: { projects: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ["areas-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
export const getHome = unstable_cache(
  async () => {
    const [areas, projects, total] = await Promise.all([
      getAreas(),
      db.project.findMany({
        where: publicWhere,
        select: projectSelect,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        take: 6,
      }),
      db.project.count({ where: publicWhere }),
    ]);
    return { areas, projects: projects.map((project) => publicProjectCopy(projectLists(project))), total };
  },
  ["home-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
export const getArea = unstable_cache(
  async (slug: string) =>
    db.area.findFirst({ where: { slug, isActive: true } }),
  ["area-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
async function queryProjects({
  areaId,
  q,
  type,
  year,
  tag,
  page = 1,
}: {
  areaId?: string;
  q?: string;
  type?: string;
  year?: string;
  tag?: string;
  page?: number;
} = {}) {
  const where: Prisma.ProjectWhereInput = {
    ...publicWhere,
    ...(areaId ? { areaId } : {}),
    ...(type === "PROJECT" || type === "SYSTEM" || type === "WEBSITE"
      ? { type }
      : {}),
    ...(year && /^\d{4}$/.test(year) ? { year: Number(year) } : {}),
    ...(tag ? { tags: { array_contains: [tag.slice(0, 100)] } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q.slice(0, 200) } },
            { summary: { contains: q.slice(0, 200) } },
            { tags: { array_contains: [q.slice(0, 100)] } },
          ],
        }
      : {}),
  };
  const current = Math.min(Math.max(1, Math.floor(page) || 1), 10000);
  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      select: projectSelect,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip: (current - 1) * 9,
      take: 9,
    }),
    db.project.count({ where }),
  ]);
  return {
    projects: projects.map((project) => publicProjectCopy(projectLists(project))),
    total,
    page: current,
    pages: Math.ceil(total / 9),
  };
}
const getCachedCatalog = unstable_cache(
  async (areaId: string, type: string, year: string, page: number) =>
    queryProjects({
      areaId: areaId || undefined,
      type: type || undefined,
      year: year || undefined,
      page,
    }),
  ["public-project-catalog-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
export async function findProjects(
  options: Parameters<typeof queryProjects>[0] = {},
) {
  const page = Math.min(Math.max(1, Math.floor(options.page || 1)), 10000);
  const type =
    options.type === "PROJECT" ||
    options.type === "SYSTEM" ||
    options.type === "WEBSITE"
      ? options.type
      : "";
  const year = options.year && /^\d{4}$/.test(options.year) ? options.year : "";
  // Keep free text and deep pagination out of the shared disk cache.
  // This bounds the reusable catalog to frequent, public filter combinations.
  if (
    !options.q &&
    !options.tag &&
    page <= 20 &&
    (!year || (Number(year) >= 2000 && Number(year) <= 2100))
  ) {
    return getCachedCatalog(options.areaId || "", type, year, page);
  }
  return queryProjects({ ...options, page });
}
export const getProject = unstable_cache(
  async (slug: string) => {
    const project = await db.project.findFirst({
      where: { ...publicWhere, slug },
      select: {
        ...projectSelect,
        content: true,
        coverMediaId: true,
        coverLinkUrl: true,
        coverLinkText: true,
        media: {
          orderBy: { order: "asc" },
          select: { id: true, url: true, alt: true },
        },
        system: {
          select: {
            id: true,
            systemName: true,
            url: true,
            environment: true,
            credentialVisibility: true,
          },
        },
      },
    });
    return project ? publicProjectCopy(projectLists(project)) : null;
  },
  ["project-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
export const getSettings = unstable_cache(
  async () =>
    db.siteSettings.findUnique({
      where: { id: 1 },
      select: {
        siteName: true,
        logoUrl: true,
        contactEmail: true,
        notice: true,
      },
    }),
  ["settings"],
  { tags: ["catalog"], revalidate: 60 },
);

export const getShowcaseSlides = unstable_cache(
  async (areaIds?: string[]) => {
    const [images, areas] = await Promise.all([
      db.media.findMany({
        where: {
          project: {
            ...publicWhere,
            ...(areaIds ? { areaId: { in: areaIds } } : {}),
          },
        },
        select: {
          id: true,
          url: true,
          alt: true,
          project: {
            select: {
              slug: true,
              title: true,
              summary: true,
              type: true,
              coverLinkUrl: true,
              area: { select: { name: true } },
            },
          },
        },
        orderBy: [
          { project: { updatedAt: "desc" } },
          { order: "asc" },
          { id: "asc" },
        ],
        take: 60,
      }),
      db.area.findMany({
        where: {
          isActive: true,
          coverImageUrl: { not: null },
          ...(areaIds ? { id: { in: areaIds } } : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverImageUrl: true,
        },
        orderBy: { order: "asc" },
      }),
    ]);
    return [
      ...areas
        .filter((area) => area.coverImageUrl)
        .map((area) => ({
          id: `area-${area.id}`,
          url: area.coverImageUrl!,
          alt: `Portada de ${area.name}`,
          title: area.name,
          description:
            area.description || "Conoce las soluciones de nuestro equipo.",
          area: area.name,
          href: `/${area.slug}`,
        })),
      ...images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        title: correctPublicCopy(image.project.title),
        description: correctPublicCopy(image.project.summary),
        area: image.project.area.name,
        href: `/proyectos/${image.project.slug}`,
        type: image.project.type,
        externalHref:
          image.project.type === "WEBSITE" &&
          image.project.coverLinkUrl &&
          /^https?:\/\//.test(image.project.coverLinkUrl) &&
          URL.canParse(image.project.coverLinkUrl)
            ? image.project.coverLinkUrl
            : undefined,
      })),
    ];
  },
  ["showcase-slides-public-seo-v3"],
  { tags: ["catalog"], revalidate: 60 },
);
