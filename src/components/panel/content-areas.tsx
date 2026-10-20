import Link from "next/link";
import {
  Code2,
  Palette,
  ShieldCheck,
  Headphones,
  FolderOpen,
  Plus,
} from "lucide-react";
export function ContentAreas({
  areas,
}: {
  areas: { id: string; name: string; slug: string }[];
}) {
  const icons = {
    sistemas: Code2,
    marketing: Palette,
    ciberseguridad: ShieldCheck,
    "soporte-tecnico": Headphones,
  };
  return (
    <section
      className="dashboard-content-areas"
      aria-labelledby="content-areas-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="content-areas-title">Paso 1 · Selecciona el área</h2>
          <p className="notice">
            Selecciona el área. En el paso 2 cargarás el título, la información,
            la fecha y las fotos del mismo trabajo.
          </p>
        </div>
      </div>
      {areas.length ? (
        <div className="content-area-grid">
          {areas.map((area) => {
            const Icon = icons[area.slug as keyof typeof icons] || FolderOpen;
            return (
              <article className="panel-card content-area-card" key={area.id}>
                <div className="content-area-heading">
                  <Icon size={22} aria-hidden="true" />
                  <h3>{area.name}</h3>
                </div>
                <p className="notice">
                  {area.slug === "sistemas"
                    ? "Publica sistemas de gestión y páginas web con sus enlaces."
                    : area.slug === "marketing"
                      ? "Fotos, título, información, fecha y enlace opcional."
                      : "Fotos, título, información, fecha y enlace opcional."}
                </p>
                <div className="form-actions">
                  <Link
                    className="button primary"
                    href={`/panel/proyectos/nuevo?areaId=${area.id}`}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Seleccionar área
                  </Link>

                  <Link
                    className="text-link"
                    href={`/panel/proyectos?areaId=${area.id}`}
                  >
                    Ver publicaciones
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">
          No tienes áreas activas asignadas. Solicita al administrador que te
          asigne un área para publicar.
        </p>
      )}
    </section>
  );
}
