"use client";
import { descriptiveImageAlt } from "@/lib/image-alt";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";
import { useCarousel } from "./use-carousel";
export type CarouselSlide = {
  id: string;
  url: string;
  alt: string;
  title: string;
  description: string;
  area: string;
  href: string;
  type?: string;
  externalHref?: string;
};
export function Carousel({
  slides,
  label = "Imágenes de nuestros proyectos",
  variant = "default",
}: {
  slides: CarouselSlide[];
  label?: string;
  variant?: "default" | "hero";
}) {
  const root = useRef<HTMLDivElement>(null);
  const c = useCarousel(slides.length, root);
  if (!slides.length)
    return (
      <div
        className={`carousel-empty panel-card ${variant === "hero" ? "hero-carousel-empty" : ""}`}
      >
        <p className="eyebrow">{label}</p>
        <h2>Pronto verás nuestro trabajo aquí</h2>
        <p className="notice">
          Las imágenes de los proyectos publicados aparecerán en este espacio.
        </p>
      </div>
    );
  const current = slides[c.index];
  const previous = slides[c.previousIndex];
  return (
    <div
      ref={root}
      className={`portfolio-carousel ${variant === "hero" ? "hero-carousel" : ""}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      onMouseEnter={() => c.setHovered(true)}
      onMouseLeave={() => c.setHovered(false)}
      onFocusCapture={() => c.setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          c.setPaused(false);
      }}
    >
      <div className="carousel-stage" aria-live={c.playing ? "off" : "polite"}>
        <div
          className="carousel-slide"
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${c.index + 1} de ${slides.length}`}
        >
          <div className="carousel-image">
            {previous.id !== current.id && (
              <Image
                key={`${previous.id}-outgoing`}
                className="carousel-outgoing"
                src={previous.url}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={previous.url.startsWith("/api/media/")}
              />
            )}
            <Image
              loading={variant === "hero" && c.index === 0 ? "eager" : "lazy"}
              fetchPriority={
                variant === "hero" && c.index === 0 ? "high" : "auto"
              }
              key={`${current.id}-incoming`}
              className={
                c.index === 0 && c.previousIndex === 0
                  ? "carousel-initial"
                  : "carousel-incoming"
              }
              src={current.url}
              alt={descriptiveImageAlt(
                current.alt,
                `${current.title}: ${current.area}, Códex Cusco`,
              )}
              fill
              sizes="(max-width: 768px) 100vw, 65vw"
              unoptimized={current.url.startsWith("/api/media/")}
            />
          </div>
          <div className="carousel-caption">
            <p className="eyebrow">{current.area}</p>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
            {current.type === "WEBSITE" && current.externalHref ? (
              <a
                className="button primary"
                href={current.externalHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visitar página web
              </a>
            ) : (
              <Link className="button primary" href={current.href}>
                {current.type === "SYSTEM"
                  ? "Ver sistema y accesos"
                  : current.type === "WEBSITE"
                    ? "Ver página web"
                    : "Conocer más"}{" "}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
