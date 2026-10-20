"use client";
import Image from "next/image";
import { useRef } from "react";
import { useCarousel } from "./use-carousel";
export function Gallery({
  images,
}: {
  images: { id: string; url: string; alt: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const c = useCarousel(images.length, root);
  const index = c.index;
  const dialog = useRef<HTMLDialogElement>(null);
  if (!images.length)
    return <p className="empty-state">Sin imágenes disponibles.</p>;
  const current = images[index];
  const previous = images[c.previousIndex];
  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Imágenes del proyecto"
      onMouseEnter={() => c.setHovered(true)}
      onMouseLeave={() => c.setHovered(false)}
      onFocusCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-carousel-toggle]"))
          c.setPaused(true);
      }}
    >
      <button
        type="button"
        className="gallery-main"
        style={{ width: "100%", border: 0, cursor: "zoom-in" }}
        onClick={() => dialog.current?.showModal()}
        aria-label="Ampliar imagen"
      >
        {previous.id !== current.id && (
          <Image
            key={`${previous.id}-outgoing`}
            className="carousel-outgoing"
            src={previous.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width:900px) 100vw, 65vw"
            unoptimized={previous.url.startsWith("/api/media/")}
          />
        )}
        <Image
          key={`${current.id}-incoming`}
          className="carousel-incoming"
          unoptimized={current.url.startsWith("/api/media/")}
          src={current.url}
          alt={current.alt}
          fill
          sizes="(max-width:900px) 100vw, 65vw"
          preload
        />
      </button>
      {images.length > 1 && (
        <div className="carousel-controls">
          <button
            type="button"
            className="button secondary button-small"
            aria-label="Imagen anterior"
            onClick={() => c.move(-1)}
          >
            Anterior
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            className="button secondary button-small"
            aria-label="Imagen siguiente"
            onClick={() => c.move(1)}
          >
            Siguiente
          </button>
          <button
            type="button"
            className="button secondary button-small"
            data-carousel-toggle
            disabled={c.reduced}
            onClick={() => c.setPaused(!c.paused)}
          >
            {c.paused ? "Reanudar" : "Pausar"}
          </button>
        </div>
      )}
      <div className="gallery-thumbs">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            aria-label={`Ver imagen ${i + 1}: ${image.alt}`}
            aria-pressed={i === index}
            onClick={() => c.select(i)}
          >
            <Image
              unoptimized={image.url.startsWith("/api/media/")}
              src={image.url}
              alt={image.alt}
              fill
              sizes="90px"
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox-dialog"
        aria-label="Galería ampliada"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") c.move(1);
          if (event.key === "ArrowLeft") c.move(-1);
        }}
      >
        <div className="lightbox-content">
          <button
            className="button secondary lightbox-close"
            onClick={() => dialog.current?.close()}
          >
            Cerrar ×
          </button>
          <div className="lightbox-image">
            <Image
              unoptimized={current.url.startsWith("/api/media/")}
              src={current.url}
              alt={current.alt}
              fill
              sizes="95vw"
            />
          </div>
          <div className="stack">
            <button className="button secondary" onClick={() => c.move(-1)}>
              Anterior
            </button>
            <span>
              {index + 1} / {images.length}
            </span>
            <button className="button secondary" onClick={() => c.move(1)}>
              Siguiente
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
