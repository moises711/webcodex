import Link from "next/link";
import { getServiceContent } from "@/lib/service-content";
import { jsonLd, siteUrl } from "@/lib/seo";
import { requestNonce } from "@/lib/nonce";
export async function ServiceContent({ slug }: { slug: string }) {
  const content = getServiceContent(slug);
  if (!content) return null;
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/${slug}#preguntas-frecuentes`,
    mainEntity: content.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <section
      className="service-content stack"
      aria-labelledby="service-details-title"
    >
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faq) }}
      />
      <h2 id="service-details-title">Qué incluye este servicio</h2>
      <p>{content.intro}</p>
      <ul>
        {content.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>Cómo trabajamos contigo</h2>
      <ol>
        {content.process.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>
      {content.faqs.map((item) => (
        <details key={item.question} className="panel-card">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
      <p>
        Cuéntanos qué necesita tu negocio y definamos el alcance de tu proyecto.
      </p>
      <Link className="button primary" href="/contactanos">
        Consultar con Códex Cusco
      </Link>
    </section>
  );
}
