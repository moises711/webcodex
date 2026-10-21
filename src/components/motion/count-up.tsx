import { createElement } from "react";
// Keep one readable server-rendered value; animated and screen-reader copies
// were concatenated into misleading counts by text extraction.
export function CountUp({value}: {value: number}) {
  const count = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return createElement("span", null, new Intl.NumberFormat("es-PE").format(count));
}
