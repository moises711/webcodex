import Link from "next/link";
import { requestNonce } from "@/lib/nonce";
import { jsonLd } from "@/lib/seo";
import {
  breadcrumbStructuredData,
  type Breadcrumb,
} from "@/lib/structured-data";
export async function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <>
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbStructuredData(items)),
        }}
      />
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={item.href}>
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href}>{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
