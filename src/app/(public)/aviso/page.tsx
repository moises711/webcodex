import { getSettings } from "@/server/queries/public";
export const metadata = { title: "Aviso" };
export default async function Page() {
  const settings = await getSettings();
  return (
    <div className="container section">
      <h1>Aviso del portal</h1>
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
