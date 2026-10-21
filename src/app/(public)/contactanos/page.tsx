import { RelatedServices } from "@/components/public/related-services";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { PublicHero } from "@/components/public/public-hero";
export const metadata = pageMetadata(
  "Contáctanos en Cusco",
  "Conversa con Códex Cusco por WhatsApp o llama al +51 957 258 762. Solicita información sobre software, páginas web y servicios tecnológicos.",
  "/contactanos",
);
export default function ContactPage() {
  return (
    <div className="container section contact-page">
      <Breadcrumbs items={[{name: "Inicio", href: "/"}, {name: "Contacto", href: "/contactanos"}]} />
      <PublicHero>
        <p className="eyebrow">ESTAMOS PARA AYUDARTE</p>
        <h1>Contacta con Códex Cusco para tu proyecto</h1>
        <p className="hero-description">
          Cuéntanos qué necesitas. Escríbenos por WhatsApp o llámanos para
          conversar sobre tu idea.
        </p>
        <p className="contact-main-number">+51 957 258 762</p>
        <div className="contact-actions">
          <a
            className="button primary"
            href="https://wa.me/51957258762"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" /> Escribir por WhatsApp
          </a>
          <a className="button secondary" href="tel:+51957258762">
            <Phone size={20} aria-hidden="true" /> Llamar ahora
          </a>
        </div>
      </PublicHero>
      <div className="contact-grid">
        <section className="panel-card contact-card">
          <MessageCircle size={28} aria-hidden="true" />
          <h2>WhatsApp</h2>
          <p>Consultas, información y cotizaciones.</p>
          <a
            className="text-link"
            href="https://wa.me/51957258762"
            target="_blank"
            rel="noopener noreferrer"
          >
            +51 957 258 762
          </a>
        </section>
        <section className="panel-card contact-card">
          <Phone size={28} aria-hidden="true" />
          <h2>Llamadas</h2>
          <p>Comunícate directamente con nuestro equipo.</p>
          <a className="text-link" href="tel:+51957258762">
            +51 957 258 762
          </a>
        </section>
        <section className="panel-card contact-card">
          <Mail size={28} aria-hidden="true" />
          <h2>Correo electrónico</h2>
          <p>Envíanos los detalles de tu proyecto.</p>
          <a
            className="text-link"
            href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=codexcusco%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            codexcusco@gmail.com
          </a>
        </section>
      </div>
      <section className="panel-card contact-socials">
        <h2>También estamos en redes</h2>
        <p className="notice">
          Conoce nuestro trabajo y las novedades de Códex Cusco.
        </p>
        <div className="contact-actions">
          <a
            className="button secondary"
            href="https://www.facebook.com/share/19a2DKsK4Z/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            className="button secondary"
            href="https://instagram.com/cuscocodex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </section>
      <RelatedServices />
    </div>
  );
}
