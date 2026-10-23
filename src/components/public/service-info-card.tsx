import Link from "next/link";
import { Info, Check } from "lucide-react";
import { serviceInfo } from "@/lib/service-info";

export function ServiceInfoCard({ slug }: { slug: string }) {
  const info = serviceInfo[slug];
  if (!info) return null;
  return (
    <section
      className="panel-card service-info-card"
      aria-labelledby="service-info-title"
    >
      <div className="service-info-heading">
        <span className="service-info-icon">
          <Info size={20} aria-hidden="true" />
        </span>
        <p className="eyebrow">INFORMACIÓN DEL SERVICIO · CÓDEX CUSCO</p>
      </div>
      <div className="service-info-grid">
        <div>
          <h2 id="service-info-title">{info.title}</h2>
          <p>{info.summary}</p>
        </div>
        <ul>
          {info.items.map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="service-info-footer">
        <p>{info.note}</p>
        <Link href="/contactanos" className="button secondary button-small">
          Consultar este servicio
        </Link>
      </div>
    </section>
  );
}
