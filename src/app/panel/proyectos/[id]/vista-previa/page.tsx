import Link from "next/link";
import { formatWorkDate } from "@/lib/work-date";
import { getPanelProject } from "@/server/queries/panel";
import { ProjectGallery } from "@/components/public/project-gallery";
import { RichContent } from "@/components/public/rich-content";
export const metadata = {
  title: "Vista previa",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const project = await getPanelProject((await params).id);
  return (
    <>
      <Link
        className="button secondary"
        href={`/panel/proyectos/${project.id}`}
      >
        Volver al editor
      </Link>
      <p className="eyebrow">VISTA PREVIA PRIVADA</p>
      <h1>{project.title}</h1>
      <ProjectGallery
        images={project.media}
        coverId={project.coverMediaId}
        linkUrl={project.coverLinkUrl}
        linkText={project.coverLinkText}
      />
      <p>{project.summary}</p>
      <p className="notice">
        Fecha del trabajo: {formatWorkDate(project.workDate, project.year)}
      </p>
      <RichContent content={project.content} />
      {project.system && (
        <section className="panel-card">
          <h2>{project.system.systemName}</h2>
          <p className="notice">URL: {project.system.url}</p>
          <p className="notice">
            Las credenciales se consultan desde el editor.
          </p>
        </section>
      )}
    </>
  );
}
