"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderAreas } from "@/server/actions/admin";
export function AreaOrder({
  initial,
}: {
  initial: { id: string; name: string }[];
}) {
  const [areas, setAreas] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  function move(index: number, target: number) {
    if (target < 0 || target >= areas.length) return;
    const next = [...areas];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setAreas(next);
  }
  return (
    <section className="panel-card">
      <h2>Orden del catálogo</h2>
      <p className="notice">Arrastra las áreas o usa las flechas.</p>
      {areas.map((area, index) => (
        <div
          key={area.id}
          className="credential stack"
          draggable
          onDragStart={(event) =>
            event.dataTransfer.setData("text/plain", String(index))
          }
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const from = Number(event.dataTransfer.getData("text/plain"));
            if (Number.isInteger(from) && from >= 0 && from < areas.length)
              move(from, index);
          }}
        >
          <strong>{area.name}</strong>
          <button
            className="button secondary button-small"
            aria-label={`Subir ${area.name}`}
            onClick={() => move(index, index - 1)}
            disabled={index === 0}
          >
            Subir
          </button>
          <button
            className="button secondary button-small"
            aria-label={`Bajar ${area.name}`}
            onClick={() => move(index, index + 1)}
            disabled={index === areas.length - 1}
          >
            Bajar
          </button>
        </div>
      ))}
      <button
        className="button secondary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await reorderAreas(areas.map((a) => a.id));
              setMessage(result.error || result.message || "");
              router.refresh();
            } catch {
              setMessage("No se pudo guardar el orden");
            }
          })
        }
      >
        Guardar orden
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
