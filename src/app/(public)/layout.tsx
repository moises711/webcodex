import { businessStructuredData } from "@/lib/structured-data";
import { requestNonce } from "@/lib/nonce";
import { jsonLd } from "@/lib/seo";
import { LoginShortcut } from "@/components/public/login-shortcut";
import { PublicExperience } from "@/components/motion/public-experience";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicExperience>
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(businessStructuredData()),
        }}
      />
      <LoginShortcut />
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
    </PublicExperience>
  );
}
