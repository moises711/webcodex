import { requireSuperAdmin } from "@/lib/admin";
import { ProformaForm } from "@/components/panel/proforma-form";
export const metadata = { title: "Generador de proformas" };
export default async function Page() {
  await requireSuperAdmin();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">DOCUMENTOS COMERCIALES</p>
          <h1>Generador de proformas</h1>
          <p className="notice">
            Completa los datos, revisa el presupuesto y descarga tu proforma en
            PDF.
          </p>
        </div>
      </div>
      <ProformaForm date={date} />
    </>
  );
}
