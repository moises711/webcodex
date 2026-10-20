import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
const money = z
  .number()
  .finite()
  .min(0)
  .max(1_000_000)
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.000001,
    "Usa como máximo dos decimales",
  );
export const proformaSchema = z.object({
  number: text(50)
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, "Usa letras, números y guiones"),
  date: z.iso.date(),
  company: text(100).min(1),
  ruc: text(20),
  location: text(100),
  contact: text(180),
  client: text(150).min(1, "Ingresa el nombre del cliente"),
  document: text(30),
  address: text(240),
  phone: text(100),
  service: text(180).min(1),
  equipment: text(180),
  delivery: text(150).min(1),
  validity: z.number().int().min(1).max(365),
  scope: text(3000),
  warranty: text(600),
  payment: text(600),
  notes: text(1000),
  signer: text(100),
  taxEnabled: z.boolean(),
  taxRate: z.number().finite().min(0).max(100),
  items: z
    .array(
      z.object({
        description: text(240).min(1),
        quantity: z.number().int().min(1).max(10000),
        price: money,
      }),
    )
    .min(1)
    .max(40),
});
export type Proforma = z.infer<typeof proformaSchema>;
export function calculateProforma(
  data: Pick<Proforma, "items" | "taxEnabled" | "taxRate">,
) {
  const lines = data.items.map(
    (item) => Math.round(item.price * 100) * item.quantity,
  );
  const subtotal = lines.reduce((a, b) => a + b, 0);
  const tax = data.taxEnabled ? Math.round((subtotal * data.taxRate) / 100) : 0;
  return { lines, subtotal, tax, total: subtotal + tax };
}
export function soles(cents: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(cents / 100);
}
export const proformaDefaults: Omit<Proforma, "date"> = {
  number: "PROF-001",
  company: "Códex Cusco",
  ruc: "",
  location: "Cusco, Perú",
  contact: "+51 957 258 762 · codexcusco@gmail.com",
  client: "",
  document: "",
  address: "",
  phone: "",
  service: "",
  equipment: "",
  delivery: "",
  validity: 15,
  scope: "",
  warranty: "",
  payment: "",
  notes: "",
  signer: "",
  taxEnabled: false,
  taxRate: 18,
  items: [{ description: "", quantity: 1, price: 0 }],
};
