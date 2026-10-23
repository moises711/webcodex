"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Code2,
  Palette,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { serviceLandings } from "@/lib/service-landings";
import { portalAreas } from "@/lib/areas";
const serviceIcons = { Code2, Palette, ShieldCheck, Headphones };
export function Navigation({
  areas,
}: {
  areas: { slug: string; name: string }[];
}) {
  const path = usePathname();
  const menuServices = [
    ...serviceLandings.map((page) => ({
      slug: page.slug,
      name: page.name,
      icon: page.icon,
      description: page.description,
    })),
    ...areas.map((area) => {
      const info = portalAreas.find((item) => item.slug === area.slug);
      return {
        ...area,
        name:
          area.slug === "sistemas"
            ? "Sistemas de gestión"
            : area.slug === "marketing"
              ? "Marketing digital"
              : area.name,
        icon: info?.icon || "Code2",
        description:
          area.slug === "marketing"
            ? "Estrategia, contenido y comunicación para tu negocio."
            : info?.description,
      };
    }),
  ];
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const servicesTrigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setMobile(false);
    setExpanded(false);
  }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <div
      ref={root}
      className="navigation-shell"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          const focusTarget =
            !mobile && expanded ? servicesTrigger.current : trigger.current;
          close();
          focusTarget?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="navigation-toggle"
        aria-label={mobile ? "Cerrar navegación" : "Abrir navegación"}
        aria-expanded={mobile}
        aria-controls="main-navigation"
        onClick={() => setMobile(!mobile)}
      >
        {mobile ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav
        id="main-navigation"
        aria-label="Navegación principal"
        className={mobile ? "main-navigation is-open" : "main-navigation"}
      >
        <Link
          href="/"
          aria-current={path === "/" ? "page" : undefined}
          onClick={close}
        >
          Inicio
        </Link>
        <Link
          href="/empresa"
          aria-current={path === "/empresa" ? "page" : undefined}
          onClick={close}
        >
          Quiénes somos
        </Link>
        <div className="areas-navigation">
          <button
            ref={servicesTrigger}
            type="button"
            className="areas-trigger"
            aria-expanded={expanded}
            aria-controls="services-dropdown"
            onClick={() => setExpanded(!expanded)}
          >
            Servicios{" "}
            <ChevronDown
              size={16}
              className={expanded ? "is-rotated" : ""}
              aria-hidden="true"
            />
          </button>
          {expanded && (
            <div
              id="services-dropdown"
              className="areas-dropdown services-dropdown"
            >
              <p className="services-menu-label">SOLUCIONES PARA TU NEGOCIO</p>
              {menuServices.map((area) => {
                const info = area;
                const Icon = serviceIcons[info?.icon || "Code2"];
                return (
                  <Link
                    key={area.slug}
                    href={`/${area.slug}`}
                    className="service-navigation-link"
                    onClick={close}
                    aria-label={area.name}
                    aria-describedby={`service-summary-${area.slug}`}
                    aria-current={path === `/${area.slug}` ? "page" : undefined}
                  >
                    <span className="service-option-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="service-option-copy">
                      <strong>{area.name}</strong>
                      <small id={`service-summary-${area.slug}`}>
                        {info?.description ||
                          "Descubre las soluciones y proyectos de nuestro equipo."}
                      </small>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <Link href="/contactanos" onClick={close}>
          Contáctanos
        </Link>
      </nav>
    </div>
  );
}
