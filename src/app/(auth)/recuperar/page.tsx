import Link from "next/link";
import { RecoveryForm } from "@/components/panel/recovery-form";
export const metadata = {
  title: "Recuperar acceso",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main className="login-shell panel-card">
      <h1 style={{ fontSize: 30 }}>Recuperar acceso</h1>
      <p className="notice">El enlace de recuperación vence en 30 minutos.</p>
      {!process.env.RESEND_API_KEY && (
        <p className="notice">
          El envío de correo aún no está habilitado en este entorno. Contacta
          con la administración para recuperar tu acceso.
        </p>
      )}
      <RecoveryForm />
      <Link className="text-link" href="/ingresar">
        Volver a ingresar
      </Link>
    </main>
  );
}
