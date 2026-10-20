import Link from "next/link";
import LoginForm from "@/components/panel/login-form";
import { Brand } from "@/components/public/brand";
export const metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return (
    <main className="login-shell">
      <Link href="/" aria-label="Volver al inicio">
        <Brand />
      </Link>
      <section className="panel-card">
        <p className="eyebrow">ESPACIO DE TRABAJO</p>
        <h1 style={{ fontSize: 30 }}>Bienvenido a Códex</h1>
        <p className="notice">
          Ingresa para gestionar los proyectos de tu área.
        </p>
        <LoginForm />
        <Link className="text-link" href="/recuperar">
          ¿Olvidaste tu contraseña?
        </Link>
      </section>
    </main>
  );
}
