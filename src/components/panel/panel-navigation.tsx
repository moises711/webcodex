"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Building2,
  Users,
  FileText,
  Settings2,
  History,
  Globe,
} from "lucide-react";
export function PanelNavigation({
  admin,
  manager,
}: {
  admin: boolean;
  manager: boolean;
}) {
  const pathname = usePathname();
  const links = [
    { href: "/panel", label: "Resumen", icon: LayoutDashboard },
    {
      href: "/panel/proyectos",
      label: "Contenido",
      icon: FolderOpen,
    },
    ...(manager && !admin
      ? [
          { href: "/panel/mi-area", label: "Mi área", icon: Building2 },
          { href: "/panel/equipo", label: "Equipo", icon: Users },
        ]
      : []),
    ...(admin
      ? [
          {
            href: "/panel/admin/proformas",
            label: "Proformas",
            icon: FileText,
          },
          {
            href: "/panel/admin/areas",
            label: "Administrar áreas",
            icon: Building2,
          },
          { href: "/panel/admin/usuarios", label: "Usuarios", icon: Users },
          {
            href: "/panel/admin/ajustes",
            label: "Branding y ajustes",
            icon: Settings2,
          },
          { href: "/panel/admin/auditoria", label: "Auditoría", icon: History },
        ]
      : []),
    { href: "/", label: "Ver portal", icon: Globe },
  ];
  return (
    <nav aria-label="Panel de gestión">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/panel"
            ? pathname === href
            : href !== "/" &&
              (pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (href === "/panel/proyectos" &&
                  pathname === "/panel/contenido"));
        return (
          <Link
            key={href}
            href={href}
            className="panel-nav-link"
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
