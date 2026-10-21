import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("public website identity", () => {
  it("never advertises a temporary deployment hostname", async () => {
    vi.stubEnv("APP_URL", "https://red-oryx-303419.hostingersite.com");
    vi.stubEnv(
      "NEXT_PUBLIC_SITE_URL",
      "https://red-oryx-303419.hostingersite.com",
    );
    const { pageMetadata, siteUrl } = await import("../src/lib/seo");
    expect(siteUrl).toBe("https://codexcusco.com");
    const metadata = pageMetadata(
      "Páginas web en Cusco",
      "Desarrollo web",
      "/sistemas",
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://codexcusco.com/sistemas",
    );
    expect(metadata.openGraph).toMatchObject({
      url: "https://codexcusco.com/sistemas",
    });
    const { default: robots } = await import("../src/app/robots");
    expect(robots().sitemap).toBe("https://codexcusco.com/sitemap.xml");
  });
});
