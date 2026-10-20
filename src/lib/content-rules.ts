export function hasContentMedia(
  areaSlug: string,
  coverId: string | null | undefined,
  link?: string | null,
) {
  if (!areaSlug || !coverId) return false;
  return !link || (/^https?:\/\//.test(link) && URL.canParse(link));
}
