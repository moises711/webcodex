export function AreaSelector({
  areas,
  value,
  path,
}: {
  areas: { id: string; name: string }[];
  value?: string;
  path: string;
}) {
  return (
    <form action={path} className="filters">
      <label>
        Área de trabajo
        <select name="areaId" defaultValue={value || ""}>
          <option value="">Todas mis áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <button className="button secondary">Aplicar</button>
    </form>
  );
}
