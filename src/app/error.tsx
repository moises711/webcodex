"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <h1>No pudimos cargar esta página</h1>
      <p className="notice">Intenta nuevamente en unos momentos.</p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
