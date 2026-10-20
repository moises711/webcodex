import { Reveal } from "@/components/motion/reveal";
import { ShowcaseCarousel } from "./showcase-carousel";
export function PublicHero({
  children,
  areaIds,
  label,
}: {
  children: React.ReactNode;
  areaIds?: string[];
  label?: string;
}) {
  return (
    <section className="immersive-hero interior-hero">
      <Reveal className="immersive-grid company-hero">
        <div className="hero-copy">{children}</div>
        <ShowcaseCarousel variant="hero" areaIds={areaIds} label={label} />
      </Reveal>
    </section>
  );
}
