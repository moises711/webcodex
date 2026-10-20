export default function Loading() {
  return (
    <div
      className="container section"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      <p role="status">Cargando…</p>
      <div className="cards-grid">
        {[0, 1, 2].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    </div>
  );
}
