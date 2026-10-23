import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getServiceLanding,
  serviceLandings,
} from "../src/lib/service-landings";
import { serviceInfo } from "../src/lib/service-info";
import { portalAreas } from "../src/lib/areas";
import { pageMetadata } from "../src/lib/seo";

vi.mock("../src/lib/nonce", () => ({ requestNonce: async () => "test-nonce" }));
vi.mock("../src/server/queries/public", () => ({
  getArea: vi.fn(async () => ({ id: "area-id" })),
}));
vi.mock("../src/components/public/public-hero", () => ({
  PublicHero: ({ children }: { children: ReactNode }) =>
    createElement("header", null, children),
}));
vi.mock("../src/components/public/breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));
vi.mock("../src/components/public/project-list", () => ({
  ProjectList: ({ type }: { type: string }) =>
    createElement("div", { "data-project-type": type }),
}));

describe("dedicated service pages", () => {
  it("resolves independent web, software, shop, tourism and design URLs", () => {
    expect(serviceLandings.map((page) => page.slug)).toEqual([
      "paginas-web-cusco",
      "software-a-medida-cusco",
      "tiendas-virtuales-cusco",
      "paginas-web-agencias-viajes",
      "diseno-grafico-cusco",
    ]);
    expect(getServiceLanding("not-a-service")).toBeUndefined();
    const valid = new Set(
      [...serviceLandings, ...portalAreas].map((page) => page.slug),
    );
    for (const page of serviceLandings) {
      expect(
        page.related.every((slug) => valid.has(slug) && slug !== page.slug),
      ).toBe(true);
      expect(
        pageMetadata(page.title, page.description, `/${page.slug}`).alternates
          ?.canonical,
      ).toBe(`https://codexcusco.com/${page.slug}`);
    }
  });
  it("renders one H1, service metadata and a compact information card at the end", async () => {
    const { ServiceLandingPage } =
      await import("../src/components/public/service-landing");
    for (const page of serviceLandings) {
      const html = renderToStaticMarkup(
        await ServiceLandingPage({ page, filters: {} }),
      );
      expect(html.match(/<h1>/g)).toHaveLength(1);
      expect(html).toContain(`<h1>${page.title}</h1>`);
      const data = JSON.parse(
        html.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1],
      );
      expect(data["@graph"][0].url).toBe(`https://codexcusco.com/${page.slug}`);
      expect(data["@graph"]).toHaveLength(1);
      expect(html).not.toContain('"@type":"FAQPage"');
      expect(html).toContain('class="panel-card service-info-card"');
      expect(html).toContain(serviceInfo[page.slug].summary);
      expect(html).toContain(serviceInfo[page.slug].title);
      expect(html.indexOf("service-info-card")).toBeGreaterThan(
        html.indexOf("related-services-title"),
      );
      expect(html).toContain('href="/contactanos"');
      expect(html).not.toMatch(/aggregateRating|reviewCount/);
      for (const slug of page.related)
        expect(html).toContain(`href="/${slug}"`);
      if (page.projectType)
        expect(html).toContain(`data-project-type="${page.projectType}"`);
      else expect(html).not.toContain("data-project-type");
    }
  });
});
