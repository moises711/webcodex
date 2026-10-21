export function descriptiveImageAlt(
  alt: string | null | undefined,
  fallback: string,
) {
  const value = alt?.trim();
  return !value ||
    /whatsapp image|captura desde \d|screenshot|\.(?:jpe?g|png|webp|gif)\b|^img[_ -]?\d/i.test(
      value,
    )
    ? fallback
    : value;
}
