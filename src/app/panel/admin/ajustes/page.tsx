import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/panel/action-form";
import { saveSettings } from "@/server/actions/admin";
export default async function Page() {
  await requireSuperAdmin();
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  return (
    <section className="panel-card">
      <p className="eyebrow">IDENTIDAD Y CONFIGURACIÓN</p>
      <h1>Branding y ajustes del portal</h1>
      <p className="notice">
        Personaliza el nombre, el logotipo y el contacto de la empresa. Estos
        datos se reflejan en la navegación y en la vista de empresa.
      </p>
      <ActionForm action={saveSettings}>
        <label>
          Nombre del sitio
          <input
            name="siteName"
            defaultValue={settings?.siteName || "Códex Cusco"}
            required
            maxLength={100}
          />
        </label>
        <label>
          Logo (URL del almacenamiento)
          <input
            name="logoUrl"
            defaultValue={
              settings?.logoUrl || "/resources/images/codex-cusco.jpeg"
            }
          />
        </label>
        <label>
          Correo de contacto
          <input
            type="email"
            name="contactEmail"
            defaultValue={settings?.contactEmail || ""}
          />
        </label>
        <label>
          Aviso del portal
          <textarea
            name="notice"
            defaultValue={settings?.notice || ""}
            maxLength={5000}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            name="requireReview"
            defaultChecked={settings?.requireReview}
          />
          Exigir revisión de un responsable antes de publicar
        </label>
      </ActionForm>
    </section>
  );
}
