import Link from "next/link";
import { portalAreas } from "@/lib/areas";
export function RelatedServices({ current }: { current?: string }) {
  return (
    <section className="section" aria-labelledby="related-services-title">
      <h2 id="related-services-title">Más soluciones de Códex Cusco</h2>
      <ul>
        {portalAreas
          .filter((area) => area.slug !== current)
          .map((area) => (
            <li key={area.slug}>
              <Link href={`/${area.slug}`}>{area.name} en Cusco</Link>
            </li>
          ))}
      </ul>
      <p>
        <Link className="text-link" href="/contactanos">
          Cuéntanos qué necesita tu negocio
        </Link>
      </p>
    </section>
  );
}
