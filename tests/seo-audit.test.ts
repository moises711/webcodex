import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CountUp } from "../src/components/motion/count-up";
import { serviceContent } from "../src/lib/service-content";
import { serviceSeo } from "../src/lib/service-seo";
import {
  businessStructuredData,
  breadcrumbStructuredData,
} from "../src/lib/structured-data";
import { pageMetadata, jsonLd } from "../src/lib/seo";
import { descriptiveImageAlt } from "../src/lib/image-alt";
import { correctPublicCopy, publicProjectCopy } from "../src/lib/public-copy";
vi.mock("../src/lib/db", () => ({
  db: {
    area: {
      findMany: vi.fn(async () => [
        { slug: "sistemas" },
        { slug: "marketing" },
        { slug: "ciberseguridad" },
        { slug: "soporte-tecnico" },
      ]),
    },
    project: {
      findMany: vi.fn(async () => [
        { slug: "inventario", updatedAt: new Date("2026-10-20T00:00:00Z") },
      ]),
    },
  },
}));
vi.mock("../src/server/queries/public", () => ({
  publicWhere: { status: "PUBLISHED", area: { isActive: true } },
}));
describe("public SEO audit", () => {
  it("renders real counts once without JavaScript", () => {
    expect(renderToStaticMarkup(createElement(CountUp, { value: 3 }))).toBe(
      "<span>3</span>",
    );
    expect(renderToStaticMarkup(createElement(CountUp, { value: 4 }))).toBe(
      "<span>4</span>",
    );
  });
  it("provides distinct metadata and complete visible FAQ content for all four services", () => {
    expect(Object.keys(serviceSeo)).toEqual(Object.keys(serviceContent));
    expect(
      new Set(Object.values(serviceSeo).map((item) => item.title)).size,
    ).toBe(4);
    for (const item of Object.values(serviceContent)) {
      expect(item.includes.length).toBeGreaterThanOrEqual(4);
      expect(item.process.length).toBe(4);
      expect(item.faqs.length).toBeGreaterThanOrEqual(3);
      expect(item.faqs.every((faq) => faq.question && faq.answer)).toBe(true);
    }
  });
  it("uses verified local business data without invented ratings or street address", () => {
    const business = businessStructuredData();
    expect(business["@type"]).toBe("ProfessionalService");
    expect(business.address.addressLocality).toBe("Cusco");
    expect(JSON.stringify(business)).not.toMatch(
      /streetAddress|aggregateRating|reviewCount/,
    );
    expect(
      breadcrumbStructuredData([
        { name: "Inicio", href: "/" },
        { name: "Sistemas", href: "/sistemas" },
      ]).itemListElement[1],
    ).toMatchObject({ position: 2, item: "https://codexcusco.com/sistemas" });
    expect(jsonLd({ name: "</script>" })).not.toContain("</script>");
  });
  it("shares absolute metadata URLs and avoids repeating the brand", () => {
    const metadata = pageMetadata(
      "Códex Cusco en Cusco",
      "Servicios tecnológicos",
      "/empresa",
    );
    expect(metadata.title).toEqual({ absolute: "Códex Cusco en Cusco" });
    expect(metadata.alternates?.canonical).toBe(
      "https://codexcusco.com/empresa",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "Códex Cusco en Cusco",
      url: "https://codexcusco.com/empresa",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Códex Cusco en Cusco",
    });
  });
  it("corrects known spelling without changing URLs or mutating saved data", () => {
    expect(
      correctPublicCopy(
        "Se realizo el servisio con neuvos programas e instalacion",
      ),
    ).toBe("Se realizó el servicio con nuevos programas e instalación");
    const project = {
      title: "Pagina web",
      summary: "servisio",
      url: "https://example.com/pagina",
    };
    expect(publicProjectCopy(project)).toEqual({
      ...project,
      title: "Página web",
      summary: "servicio",
    });
    expect(project.title).toBe("Pagina web");
    expect(
      descriptiveImageAlt(
        "WhatsApp Image 2026.jpg",
        "Equipo de soporte de Códex Cusco",
      ),
    ).toBe("Equipo de soporte de Códex Cusco");
    expect(
      descriptiveImageAlt(
        "Captura desde 2026-10-20",
        "Proyecto de Códex Cusco",
      ),
    ).toBe("Proyecto de Códex Cusco");
    expect(descriptiveImageAlt("Panel de inventario", "Proyecto")).toBe(
      "Panel de inventario",
    );
  });
  it("lists every active service and published project on the canonical host", async () => {
    const { default: sitemap } = await import("../src/app/sitemap");
    const entries = await sitemap();
    for (const slug of [
      "sistemas",
      "marketing",
      "ciberseguridad",
      "soporte-tecnico",
      "proyectos/inventario",
      "paginas-web-cusco",
      "software-a-medida-cusco",
      "tiendas-virtuales-cusco",
      "paginas-web-agencias-viajes",
      "diseno-grafico-cusco",
    ])
      expect(
        entries.some((item) => item.url === `https://codexcusco.com/${slug}`),
      ).toBe(true);
    expect(entries.every((item) => !item.url.includes("hostingersite"))).toBe(
      true,
    );
    const { db } = await import("../src/lib/db");
    expect(db.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED", area: { isActive: true } },
      }),
    );
    const { default: robots } = await import("../src/app/robots");
    expect(robots().sitemap).toBe("https://codexcusco.com/sitemap.xml");
  });
});
