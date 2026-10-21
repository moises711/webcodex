import { describe, expect, it } from "vitest";
import { projectMetadata, projectStructuredData } from "../src/lib/project-seo";
import { jsonLd, siteUrl } from "../src/lib/seo";
const project = {
  slug: "control-inventarios",
  title: "Control de inventarios",
  summary: "Sistema administrativo para controlar inventarios.",
  type: "SYSTEM",
  area: { name: "Sistemas", slug: "sistemas" },
  cover: { url: "/api/media/cover.webp", alt: "Vista del sistema" },
  updatedAt: new Date("2026-10-20T12:00:00Z"),
  system: { systemName: "Inventarios", url: "https://example.com" },
};
describe("SEO de los trabajos publicados", () => {
  it("accepts dates serialized by the server cache", () => {
    const data = projectStructuredData({
      ...project,
      updatedAt: "2026-10-20T12:00:00.000Z",
    });
    expect(data["@graph"][0].dateModified).toBe("2026-10-20T12:00:00.000Z");
  });
  it("uses a unique canonical and descriptive title and image", () => {
    const metadata = projectMetadata(project);
    expect(metadata.title).toBe("Control de inventarios | Sistema de gestión");
    expect(metadata.alternates?.canonical).toBe(
      `${siteUrl}/proyectos/control-inventarios`,
    );
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.description).toBe(project.summary);
  });
  it("describes the system and crawlable breadcrumbs without invented ratings or prices", () => {
    const data = projectStructuredData(project);
    expect(data["@graph"][1]["@type"]).toBe("SoftwareApplication");
    expect(
      data["@graph"][2].itemListElement?.map((item) => item.position),
    ).toEqual([1, 2, 3]);
    expect(JSON.stringify(data)).not.toMatch(
      /password|credentials|aggregateRating|offers/,
    );
  });
  it("uses CreativeWork for other areas and safely escapes HTML in JSON-LD", () => {
    const data = projectStructuredData({
      ...project,
      type: "PROJECT",
      title: "</script><script>alert(1)</script>",
    });
    expect(data["@graph"][1]["@type"]).toBe("CreativeWork");
    expect(jsonLd(data)).not.toContain("</script>");
  });
});
