"use client";
import { useState, useTransition } from "react";
import { revealCredentials } from "@/server/actions/credentials";
type Credential = {
  id: string;
  label: string;
  username: string;
  password: string;
  notes: string | null;
};
export function Credentials({
  projectId,
  panel = false,
}: {
  projectId: string;
  panel?: boolean;
}) {
  const [values, setValues] = useState<Credential[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function reveal() {
    start(async () => {
      try {
        const result = await revealCredentials(projectId, panel);
        setValues(result);
        setRevealed(true);
        setMessage(result.length ? "" : "No hay credenciales activas.");
      } catch {
        setMessage("No se pudo acceder a las credenciales.");
      }
    });
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copiado");
    } catch {
      setMessage("No se pudo copiar. Selecciona el texto manualmente.");
    }
  }
  return (
    <div>
      <p className="notice">
        Credenciales de demostración. No usar datos reales.
      </p>
      {!revealed ? (
        <button
          className="button secondary"
          onClick={reveal}
          disabled={pending}
        >
          {pending ? "Consultando…" : "Mostrar credenciales demo"}
        </button>
      ) : (
        <>
          <button
            className="button secondary"
            onClick={() => {
              setValues([]);
              setRevealed(false);
              setMessage("");
            }}
          >
            Ocultar credenciales
          </button>
          {values.map((c) => (
            <div className="credential" key={c.id}>
              <strong>{c.label}</strong>
              <p className="mono">Usuario: {c.username}</p>
              <p className="mono">Contraseña: {c.password}</p>
              <button
                className="button secondary button-small"
                onClick={() => copy(c.username)}
              >
                Copiar usuario
              </button>
              <button
                className="button secondary button-small"
                onClick={() => copy(c.password)}
              >
                Copiar contraseña
              </button>
              {c.notes && <p className="notice">{c.notes}</p>}
            </div>
          ))}
        </>
      )}
      <p role="status" className="notice">
        {message}
      </p>
    </div>
  );
}
