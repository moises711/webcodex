export function formatWorkDate(
  value?: Date | string | null,
  year?: number | null,
) {
  if (!value) return year ? String(year) : "Fecha sin especificar";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
