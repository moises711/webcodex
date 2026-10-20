"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const storageKey = "codex-home-visit";
const sessionDuration = 30 * 60 * 1000;

function getVisitId() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      stored &&
      typeof stored.id === "string" &&
      typeof stored.startedAt === "number" &&
      Date.now() - stored.startedAt < sessionDuration
    ) {
      return stored.id;
    }
  } catch {
    /* Storage may be disabled. The counter still works. */
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ id, startedAt: Date.now() }),
    );
  } catch {
    /* Keep the current visit in memory when storage is unavailable. */
  }
  return id;
}

export function PageViews() {
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const visitId = getVisitId();
    fetch("/api/page-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId }),
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (active) {
          setTotal(data.total);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section
      className="container page-views"
      aria-label="Visitas a la página principal"
    >
      <Eye size={20} aria-hidden="true" />
      <p aria-live="polite">
        {total !== null ? (
          <>
            <strong>{new Intl.NumberFormat("es-PE").format(total)}</strong>{" "}
            {total === 1 ? "visita" : "visitas"} a nuestra página
          </>
        ) : failed ? (
          "Contador temporalmente no disponible."
        ) : (
          "Cargando visitas…"
        )}
      </p>
      {failed && (
        <button
          type="button"
          className="text-link"
          onClick={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
        >
          Reintentar
        </button>
      )}
    </section>
  );
}
