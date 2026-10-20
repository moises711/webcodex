import { InteractiveCard } from "@/components/motion/interactive-card";
import Image from "next/image";
import { formatWorkDate } from "@/lib/work-date";
import { safeUrl } from "./rich-content";
import { Code2, Palette, Headphones, ShieldCheck } from "lucide-react";
export function AreaCard({
  area,
}: {
  area: {
    name: string;
    slug: string;
    description: string | null;
    color: string;
    icon: string | null;
    _count: { projects: number };
  };
}) {
  const icons = { Code2, Palette, Headphones, ShieldCheck };
  const Icon = icons[area.icon as keyof typeof icons] || Code2;
  return (
    <InteractiveCard
      className="area-card"
      href={`/${area.slug}`}
      style={{ "--area-color": area.color } as React.CSSProperties}
    >
      <Icon size={28} strokeWidth={1.75} className="area-icon" />
      <h3>{area.name}</h3>
      <p>{area.description}</p>
      <div className="card-bottom">
        <span className="badge">
          {area._count.projects}{" "}
          {area._count.projects === 1 ? "proyecto" : "proyectos"}
        </span>
      </div>
    </InteractiveCard>
  );
}
export function ProjectCard({
  project,
}: {
  project: {
    slug: string;
    title: string;
    summary: string;
    type: string;
    coverLinkUrl?: string | null;
    workDate?: Date | string | null;
    year: number | null;
    tags: string[];
    area: { name: string };
    cover: { url: string; alt: string } | null;
  };
}) {
  const external =
    project.type === "WEBSITE" &&
    project.coverLinkUrl &&
    safeUrl(project.coverLinkUrl)
      ? project.coverLinkUrl
      : null;
  const content = (
    <>
      <div className="project-image">
        {project.cover && (
          <Image
            src={project.cover.url}
            alt={project.cover.alt}
            fill
            sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw"
            unoptimized={project.cover.url.startsWith("/api/media/")}
          />
        )}
      </div>
      <div className="card-info-overlay">
        <div className="stack">
          <span className="badge">{project.area.name}</span>
          {project.type === "SYSTEM" && (
            <span className="badge">Sistema de administración</span>
          )}
          {project.type === "WEBSITE" && (
            <span className="badge">Página web</span>
          )}
        </div>
        <h3>{project.title}</h3>
        <p className="card-overlay-summary">{project.summary}</p>
        <p className="notice">
          {formatWorkDate(project.workDate, project.year)}
        </p>
        {project.tags.includes("Demostración") && (
          <span className="badge">Contenido de ejemplo</span>
        )}
        {external && <span className="text-link">Visitar página web</span>}
      </div>
    </>
  );
  return external ? (
    <article className="project-card image-content-card">
      <a
        className="website-reference"
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar ${project.title}`}
      >
        {content}
      </a>
    </article>
  ) : (
    <InteractiveCard
      className="project-card image-content-card"
      href={`/proyectos/${project.slug}`}
    >
      {content}
    </InteractiveCard>
  );
}
