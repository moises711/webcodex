import { getPanelAreas, getPanelProject } from "@/server/queries/panel";
import { ProjectForm } from "@/components/panel/project-form";
import { requireEditor } from "@/lib/session";
import { canPublish } from "@/lib/permissions";
import { db } from "@/lib/db";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, areas, user, settings] = await Promise.all([
    getPanelProject(id),
    getPanelAreas(),
    requireEditor(),
    db.siteSettings.findUnique({ where: { id: 1 } }),
  ]);
  return (
    <>
      <h1>Editar proyecto</h1>
      <ProjectForm
        key={project.id}
        id={project.id}
        areas={areas}
        media={project.media.map((m) => ({ id: m.id, url: m.url, alt: m.alt }))}
        coverId={project.coverMediaId}
        status={project.status}
        allowPublish={canPublish(user, project, settings?.requireReview)}
        initial={{
          coverLinkUrl: project.coverLinkUrl || "",
          coverLinkText: project.coverLinkText || "",
          title: project.title,
          summary: project.summary,
          areaId: project.areaId,
          type: project.type,
          workDate: project.workDate?.toISOString().slice(0, 10) || "",
          year: project.year,
          tags: project.tags.join(", "),
          techStack: project.techStack.join(", "),
          isFeatured: project.isFeatured,
          content: project.content || {
            type: "doc",
            content: [{ type: "paragraph" }],
          },
          systemName: project.system?.systemName || "",
          systemUrl: project.system?.url || "",
          environment:
            project.system?.environment === "produccion"
              ? "produccion"
              : "demo",
          credentialVisibility:
            project.system?.credentialVisibility || "INTERNAL",
          credentials:
            project.system?.credentials.map((c) => ({
              ...c,
              notes: c.notes || "",
              password: "",
            })) || [],
        }}
      />
    </>
  );
}
