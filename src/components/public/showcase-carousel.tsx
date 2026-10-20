import { getShowcaseSlides } from "@/server/queries/public";
import { Carousel } from "./carousel";
export async function ShowcaseCarousel({
  areaIds,
  label,
  variant = "default",
}: {
  areaIds?: string[];
  label?: string;
  variant?: "default" | "hero";
}) {
  const slides = await getShowcaseSlides(areaIds);
  return (
    <Carousel
      key={slides.map((slide) => slide.id).join("-")}
      variant={variant}
      slides={slides}
      label={label}
    />
  );
}
