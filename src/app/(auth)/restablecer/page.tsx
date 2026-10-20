import Link from "next/link";
import { RecoveryForm } from "@/components/panel/recovery-form";
export const metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="login-shell panel-card">
      <h1 style={{ fontSize: 30 }}>Restablecer contraseña</h1>
      {token && /^[a-zA-Z0-9_-]{43}$/.test(token) ? (
        <RecoveryForm token={token} />
      ) : (
        <p className="error-message">
          El enlace no es válido. Solicita uno nuevo.
        </p>
      )}
      <Link className="text-link" href="/ingresar">
        Ir al ingreso
      </Link>
    </main>
  );
}
