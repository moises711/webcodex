"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { formatWorkDate } from "@/lib/work-date";
export function LiveContentCard({
  title,
  summary,
  date,
  area,
  type,
  link,
  photo,
  savedPhoto,
}: {
  title?: string;
  summary?: string;
  date?: string;
  area?: string;
  type?: string;
  link?: string;
  photo?: File;
  savedPhoto?: { url: string; alt: string };
}) {
  const [localPhoto, setLocalPhoto] = useState<{
    file: File;
    url: string;
  } | null>(null);
  useEffect(() => {
    if (!photo) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        setLocalPhoto({ file: photo, url: reader.result });
    };
    reader.readAsDataURL(photo);
    return () => {
      reader.onload = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [photo]);
  const src = photo
    ? localPhoto?.file === photo
      ? localPhoto.url
      : undefined
    : savedPhoto?.url;
  const validLink =
    link && /^https?:\/\//.test(link) && URL.canParse(link) ? link : null;
  const validDate =
    date && Number.isFinite(new Date(date).getTime()) ? date : null;
  return (
    <section
      id="live-preview"
      className="live-content-preview"
      aria-labelledby="live-preview-title"
    >
      <div className="live-preview-heading">
        <h2 id="live-preview-title">Vista previa de la tarjeta</h2>
        <span className="badge">En vivo</span>
      </div>
      <p className="notice">
        Se actualiza al completar la información y seleccionar fotos.
      </p>
      <article className="project-card live-content-card image-content-card">
        <div className="project-image live-preview-image">
          {src ? (
            <Image
              src={src}
              alt={title?.trim() || savedPhoto?.alt || "Foto del trabajo"}
              fill
              unoptimized
              sizes="(max-width:640px) 100vw, 340px"
            />
          ) : (
            <div className="live-image-placeholder">
              <ImagePlus size={32} aria-hidden="true" />
              <span>Tu foto aparecerá aquí</span>
            </div>
          )}
        </div>
        <div className="live-preview-body card-info-overlay">
          <div className="stack">
            <span className="badge">{area || "Área seleccionada"}</span>
            {type === "WEBSITE" && <span className="badge">Página web</span>}
            {type === "SYSTEM" && (
              <span className="badge">Sistema de administración</span>
            )}
          </div>
          <h3>{title?.trim() || "Título del contenido"}</h3>
          <p className="live-preview-summary">
            {summary?.trim() || "Aquí aparecerá la información de tu trabajo."}
          </p>
          <p className="notice">
            {validDate ? formatWorkDate(validDate) : "Fecha del trabajo"}
          </p>
          {validLink && (
            <a
              className="button secondary"
              href={validLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {type === "WEBSITE"
                ? "Visitar página web"
                : type === "SYSTEM"
                  ? "Abrir sistema"
                  : "Ver trabajo"}
            </a>
          )}
        </div>
      </article>
      <a className="button secondary preview-mobile-jump" href="#content-form">
        Volver al formulario
      </a>
      <p className="notice">
        Vista previa. El contenido se publica al pulsar Publicar.
      </p>
    </section>
  );
}
