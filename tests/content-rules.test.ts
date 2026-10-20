import { describe, expect, it } from "vitest";
import { hasContentMedia } from "../src/lib/content-rules";
describe("contenido según el área", () => {
  it("requires a photo and allows an optional valid link in every area", () => {
    for (const area of [
      "marketing",
      "soporte-tecnico",
      "ciberseguridad",
      "sistemas",
    ]) {
      expect(hasContentMedia(area, null, "https://example.com")).toBe(false);
      expect(hasContentMedia(area, "photo-id")).toBe(true);
      expect(
        hasContentMedia(area, "photo-id", "https://example.com/trabajo"),
      ).toBe(true);
      expect(hasContentMedia(area, "photo-id", "javascript:alert(1)")).toBe(
        false,
      );
    }
  });
});
