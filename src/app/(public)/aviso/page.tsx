import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getSettings } from "@/server/queries/public";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Aviso del portal de Códex Cusco", "Información de uso del portal, proyectos y sistemas de demostración de Códex Cusco, Perú.", "/aviso");
export default async function Page() {
  const settings = await getSettings();
  return (
    <div className="container section">
      <Breadcrumbs items={[{name: "Inicio", href: "/"}, {name: "Aviso", href: "/aviso"}]} />
      <h1>Aviso del portal de Códex Cusco</h1>
      <div className="panel-card rich-content">
        <p>
          {settings?.notice ||
            "Este portal presenta proyectos y soluciones de Códex Cusco."}
        </p>
        <p>
          Las credenciales de demostración son solo para pruebas. Evita
          registrar información personal o datos reales en los sistemas demo.
        </p>
        {settings?.contactEmail && (
          <p>
            Contacto:{" "}
            <a href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
