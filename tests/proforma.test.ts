import { describe, it, expect } from "vitest";
import {
  calculateProforma,
  proformaDefaults,
  proformaSchema,
} from "../src/lib/proforma";
describe("proforma amounts and validation", () => {
  it("calculates in cents, including line rounding and optional tax", () => {
    const data = {
      items: [{ description: "Servicio", quantity: 7, price: 7.71 }],
      taxEnabled: true,
      taxRate: 18,
    };
    expect(calculateProforma(data)).toEqual({
      lines: [5397],
      subtotal: 5397,
      tax: 971,
      total: 6368,
    });
    expect(calculateProforma({ ...data, taxEnabled: false }).total).toBe(5397);
  });
  it("rejects empty clients, negative prices, excessive decimals and invalid dates", () => {
    const valid = {
      ...proformaDefaults,
      date: "2026-10-13",
      client: "Cliente",
      service: "Desarrollo de software",
      delivery: "Según cronograma acordado",
      items: [{ description: "Servicio", quantity: 1, price: 100 }],
    };
    expect(proformaSchema.safeParse(valid).success).toBe(true);
    for (const patch of [
      { client: "" },
      { date: "2026-02-30" },
      { items: [{ description: "Servicio", quantity: 1, price: -1 }] },
      { items: [{ description: "Servicio", quantity: 1, price: 7.714 }] },
    ])
      expect(proformaSchema.safeParse({ ...valid, ...patch }).success).toBe(
        false,
      );
  });
});
