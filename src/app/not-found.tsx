import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container section">
      <p className="eyebrow">404</p>
      <h1>Esta página no está disponible</h1>
      <p className="notice">
        El proyecto puede haberse archivado o la dirección cambió.
      </p>
      <Link className="button primary" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
