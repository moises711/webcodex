"use client";
import { Ambient } from "./ambient";
import Link from "next/link";
import { CircuitScene } from "./circuit-scene";
export function HeroScene({
  children,
  areas,
}: {
  children: React.ReactNode;
  areas: { name: string; slug: string }[];
}) {
  return (
    <Ambient className="hero-scene" hidden={false}>
      <div className="scene-coordinate" aria-hidden="true">
        CÓDEX / CONEXIONES
      </div>
      <CircuitScene />
      <div className="scene-orbit orbit-one" aria-hidden="true" />
      <div className="scene-orbit orbit-two" aria-hidden="true" />
      <div className="scene-logo">{children}</div>
      <div className="scene-areas">
        {areas.slice(0, 4).map((area, index) => (
          <Link
            key={area.slug}
            className={`scene-area scene-area-${index}`}
            href={`/${area.slug}`}
          >
            <span className="scene-node" />
            {area.name}
          </Link>
        ))}
      </div>
      <div className="scene-bottom">
        <span>Todo comienza con una conexión.</span>
      </div>
    </Ambient>
  );
}
