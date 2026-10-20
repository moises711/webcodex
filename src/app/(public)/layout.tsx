import { requestNonce } from "@/lib/nonce";
import { jsonLd, siteUrl } from "@/lib/seo";
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
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "Códex Cusco",
            url: siteUrl,
            logo: `${siteUrl}/resources/images/codex-cusco-logo.png`,
            email: "codexcusco@gmail.com",
            telephone: "+51957258762",
            areaServed: "Cusco, Perú",
            sameAs: [
              "https://www.facebook.com/share/19a2DKsK4Z/",
              "https://instagram.com/cuscocodex",
            ],
          }),
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
