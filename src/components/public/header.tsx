import { getSettings, getAreas } from "@/server/queries/public";
import Link from "next/link";
import { Brand } from "./brand";
import { Navigation } from "./navigation";
export async function Header() {
  const [settings, areas] = await Promise.all([getSettings(), getAreas()]);
  return (
    <header
      className="header"
      style={{
        background: "color-mix(in srgb, var(--surface) 35%, transparent)",
      }}
    >
      <div className="container header-inner">
        <Link
          href="/"
          aria-label="Códex Cusco, inicio"
          style={{
            filter:
              "drop-shadow(0 0 1px color-mix(in srgb, var(--logo-bg) 65%, transparent)) drop-shadow(0 0 3px color-mix(in srgb, var(--logo-bg) 30%, transparent))",
          }}
        >
          <Brand
            src={settings?.logoUrl || undefined}
            name={settings?.siteName || undefined}
          />
        </Link>
        <Navigation areas={areas.map(({ slug, name }) => ({ slug, name }))} />
      </div>
    </header>
  );
}
