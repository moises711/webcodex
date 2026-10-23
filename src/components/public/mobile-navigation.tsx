"use client";
import { serviceLandings } from "@/lib/service-landings";
import Link from "next/link";
import { portalAreas } from "@/lib/areas";
import { usePathname } from "next/navigation";
import { Home, Layers, UsersRound, Phone } from "lucide-react";
const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/servicios", label: "Servicios", icon: Layers },
  { href: "/empresa", label: "Nosotros", icon: UsersRound },
  { href: "/contactanos", label: "Contacto", icon: Phone },
];
export function MobileNavigation() {
  const pathname = usePathname();
  if (pathname.startsWith("/panel")) return null;
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación para teléfonos">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/servicios"
            ? serviceLandings.some((page) => pathname === `/${page.slug}`) ||
              portalAreas.some((area) => pathname === `/${area.slug}`) ||
              pathname.startsWith("/servicios") ||
              pathname.startsWith("/proyectos")
            : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-tab-icon">
              <Icon size={23} aria-hidden="true" />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
