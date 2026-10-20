import { requestNonce } from "@/lib/nonce";
import Link from "next/link";
import { projectMetadata, projectStructuredData } from "@/lib/project-seo";
import { jsonLd } from "@/lib/seo";
import { formatWorkDate } from "@/lib/work-date";
import { notFound } from "next/navigation";
import { getProject } from "@/server/queries/public";
import { getActor } from "@/lib/session";
import { canViewCredentials } from "@/lib/permissions";
import { ProjectGallery } from "@/components/public/project-gallery";
import { RichContent, safeUrl } from "@/components/public/rich-content";
import { Credentials } from "@/components/public/credentials";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  return projectMetadata(p);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const user = await getActor();
  const system = project.system;
  const visible =
    system &&
    canViewCredentials(user?.mustChangePassword ? null : user, {
      areaId: project.area.id,
      credentialVisibility: system.credentialVisibility,
    });
  return (
    <div className="container section">
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(projectStructuredData(project)),
        }}
      />
      <div className="page-title">
        <Link href={`/${project.area.slug}`} className="badge">
          {project.area.name}
        </Link>
        <h1>{project.title}</h1>
        {project.tags.includes("Demostración") && (
          <p className="notice">
            Proyecto de demostración: el contenido y los accesos son ficticios.
          </p>
        )}
      </div>
      <div className="detail-layout">
        <div>
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
        </div>
        <aside>
          <section className="panel-card">
            <h3>Sobre este proyecto</h3>
            <p className="notice">Año: {project.year || "Sin especificar"}</p>
            <div className="stack">
              {[...project.tags, ...project.techStack].map((tag, i) => (
                <span className="badge" key={`${tag}-${i}`}>
                  {tag}
                </span>
              ))}
            </div>
          </section>
          {system && (
            <section className="panel-card" style={{ marginTop: 20 }}>
              <span className="badge">
                Sistema ·{" "}
                {system.environment === "demo" ? "Demo" : "Producción"}
              </span>
              <h3>{system.systemName}</h3>
              {safeUrl(system.url) && (
                <a
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button primary"
                >
                  Abrir sistema
                </a>
              )}
              {visible ? (
                <Credentials projectId={project.id} />
              ) : system.credentialVisibility === "INTERNAL" ? (
                <p className="notice">
                  <Link href="/ingresar">Ingresa</Link> para consultar los
                  accesos de demostración.
                </p>
              ) : null}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
