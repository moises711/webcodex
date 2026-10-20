import { requireActor } from "@/lib/session";
import PasswordForm from "@/components/panel/password-form";
export default async function Page() {
  await requireActor();
  return (
    <main className="login-shell panel-card">
      <h1 style={{ fontSize: 30 }}>Actualiza tu contraseña</h1>
      <p className="notice">
        Antes de continuar, reemplaza tu contraseña temporal. Usa al menos 10
        caracteres.
      </p>
      <PasswordForm />
    </main>
  );
}
