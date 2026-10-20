import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPanelAreas } from "@/server/queries/panel";
import { ProjectForm } from "@/components/panel/project-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; areaId?: string }>;
}) {
  const areas = await getPanelAreas();
  const { type, areaId } = await searchParams;
  if (areaId && !areas.some((area) => area.id === areaId)) notFound();
  const systems = areas.find((area) => area.slug === "sistemas");
  const selected =
    areas.find((area) => area.id === areaId) ||
    (type === "SYSTEM" || type === "WEBSITE" ? systems : undefined);
  if (!selected) redirect("/panel/contenido");
  return (
    <>
      <div
        className="creation-progress"
        aria-label="Pasos para crear contenido"
      >
        <Link href="/panel/contenido">1. Seleccionar área</Link>
        <span aria-current="step">2. Cargar contenido</span>
      </div>
      <h1>Paso 2 · Cargar contenido</h1>
      <p className="notice">
        Área seleccionada: <strong>{selected?.name}</strong>. Completa la
        información y agrega las fotos. Después de guardar podrás revisar y
        publicar.
      </p>
      {areas.length ? (
        <ProjectForm
          key={selected!.id}
          areas={areas}
          initial={{
            coverLinkUrl: "",
            coverLinkText: "",
            title: "",
            summary: "",
            areaId: selected!.id,
            type:
              selected!.slug === "sistemas"
                ? type === "SYSTEM"
                  ? "SYSTEM"
                  : "WEBSITE"
                : "PROJECT",
            workDate: "",
            year: new Date().getFullYear(),
            tags: "",
            techStack: "",
            isFeatured: false,
            content: { type: "doc", content: [{ type: "paragraph" }] },
            systemName: "",
            systemUrl: "",
            environment: "demo",
            credentialVisibility: "INTERNAL",
            credentials: [],
          }}
        />
      ) : (
        <p className="empty-state">
          Necesitas un área activa asignada para crear proyectos.
        </p>
      )}
    </>
  );
}
