import { Ambient } from "@/components/motion/ambient";
import Link from "next/link";
export function Footer() {
  return (
    <footer id="contacto" className="footer">
      <Ambient className="footer-circuit">
        <span />
      </Ambient>
      <div className="container footer-inner">
        <p>
          <strong>Códex Cusco</strong>
          <br />
          Ideas, equipos y soluciones conectadas.
        </p>
        <div className="stack footer-links">
          <a
            href="https://www.facebook.com/share/19a2DKsK4Z/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook de Códex Cusco"
            className="footer-social"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v2H6v4h3v9h4v-9h3l1-4h-4V9c0-.7.3-1 1-1Z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/cuscocodex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Códex Cusco"
            className="footer-social"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
          <a
            href="https://wa.me/51957258762"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp de Códex Cusco: +51 957 258 762"
            className="footer-social"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" />
              <path d="m8.5 7.5 1.3 2-1 1.3a8 8 0 0 0 3.4 3.4l1.3-1 2 1.3c.4.3.5.8.2 1.2-.5.7-1.3 1-2.1.8a10 10 0 0 1-7.1-7.1c-.2-.8.1-1.6.8-2.1.4-.3.9-.2 1.2.2Z" />
            </svg>
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=codexcusco%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-email"
            aria-label="Enviar correo a codexcusco@gmail.com"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            codexcusco@gmail.com
          </a>
          <Link href="/aviso">Aviso</Link>
          <Link href="/">Volver al inicio</Link>
        </div>
      </div>
      <div className="container footer-copyright">
        <p>
          © {new Date().getFullYear()} Códex Cusco. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
