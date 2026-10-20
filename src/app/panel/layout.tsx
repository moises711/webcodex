import Link from "next/link";
import { PanelNavigation } from "@/components/panel/panel-navigation";
import ThemeToggle from "@/components/theme-toggle";
export const metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};
import { requireEditor } from "@/lib/session";
import { Brand } from "@/components/public/brand";
import { logout } from "@/server/actions/auth";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireEditor();
  return (
    <div className="panel-shell">
      <a className="skip-link" href="#panel-content">
        Saltar al contenido
      </a>
      <aside className="panel-sidebar">
        <Link href="/" aria-label="Volver al portal">
          <Brand />
        </Link>
        <PanelNavigation
          admin={user.role === "SUPER_ADMIN"}
          manager={
            user.role === "SUPER_ADMIN" || user.areas.some((a) => a.isManager)
          }
        />
      </aside>
      <main className="panel-main" id="panel-content">
        <header className="panel-topbar">
          <div>
            <p>
              <strong>{user.name}</strong>
            </p>
            <p className="notice">
              {user.role === "SUPER_ADMIN"
                ? "Administración general"
                : user.role === "AREA_ADMIN"
                  ? "Administración de área"
                  : "Edición de proyectos"}
            </p>
          </div>
          <div className="stack">
            <ThemeToggle />
            <form action={logout}>
              <button className="button secondary button-small">
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
