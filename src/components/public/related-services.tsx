import { serviceLandings } from "@/lib/service-landings";
import Link from "next/link";
import { portalAreas } from "@/lib/areas";
export function RelatedServices({
  current,
  related,
}: {
  current?: string;
  related?: string[];
}) {
  const links = [
    ...serviceLandings.map((page) => ({ slug: page.slug, name: page.title })),
    ...portalAreas.map((area) => ({ slug: area.slug, name: `${area.name}` })),
  ].filter(
    (page) =>
      page.slug !== current && (!related || related.includes(page.slug)),
  );
  return (
    <section className="section" aria-labelledby="related-services-title">
      <h2 id="related-services-title">Más soluciones de Códex Cusco</h2>
      <ul>
        {links.map((area) => (
          <li key={area.slug}>
            <Link href={`/${area.slug}`}>{area.name}</Link>
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
