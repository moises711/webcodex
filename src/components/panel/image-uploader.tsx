"use client";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMedia } from "@/server/actions/projects";
type Media = { id: string; url: string; alt: string };
export function ImageUploader({
  projectId,
  initial,
  initialCover,
  onChange,
}: {
  projectId: string;
  initial: Media[];
  initialCover: string | null;
  onChange?: (selection: { media: Media[]; coverId: string | null }) => void;
}) {
  const [items, setItems] = useState(initial);
  const [cover, setCover] = useState(initialCover || "");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  useEffect(() => {
    onChange?.({ media: items, coverId: cover || null });
  }, [items, cover, onChange]);
  async function upload(files: FileList | File[]) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ) {
          setMessage("Usa JPG, PNG o WebP de hasta 5 MB.");
          continue;
        }
        const form = new FormData();
        form.set("projectId", projectId);
        form.set("file", file);
        form.set("alt", file.name.replace(/\.[^.]+$/, "").slice(0, 300));
        const response = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const result = await response.json();
        if (!response.ok) {
          setMessage(result.error);
          break;
        }
        setItems((previous) => [...previous, result]);
        setCover((previous) => previous || result.id);
        setMessage(
          "Imagen subida. Revisa su texto alternativo y guarda el orden.",
        );
      }
      router.refresh();
    } catch {
      setMessage("No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  }
  function move(index: number, direction: number) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }
  function save() {
    start(async () => {
      try {
        const result = await saveMedia({
          projectId,
          media: items.map(({ id, alt }) => ({ id, alt })),
          coverId: cover || null,
        });
        setMessage(result.error || result.message || "");
        router.refresh();
      } catch {
        setMessage("Revisa el texto alternativo y la portada.");
      }
    });
  }
  return (
    <section className="form-section" id="imagenes">
      <h2>Fotos del trabajo y portada</h2>
      <div
        className="upload-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!uploading) void upload(event.dataTransfer.files);
        }}
      >
        <label>
          Arrastra imágenes aquí o selecciona archivos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <p className="notice">
          Máximo 12 imágenes · 5 MB cada una · optimización automática a WebP
        </p>
      </div>
      <p role="status" className="notice">
        {uploading ? "Subiendo y optimizando imágenes…" : message}
      </p>
      <div className="form-actions">
        <button
          type="button"
          className="button secondary"
          disabled={!cover || pending || uploading}
          onClick={() => setCover("")}
        >
          Quitar portada
        </button>
        <p className="notice">
          {cover ? "Portada seleccionada" : "Sin portada"}. Guarda los cambios
          para aplicarlos.
        </p>
      </div>
      <div className="upload-list">
        {items.map((item, index) => (
          <div
            className="upload-item"
            key={item.id}
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("text/plain", String(index))
            }
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const from = Number(event.dataTransfer.getData("text/plain"));
              if (!Number.isInteger(from) || from < 0 || from >= items.length)
                return;
              const next = [...items];
              const [moved] = next.splice(from, 1);
              next.splice(index, 0, moved);
              setItems(next);
            }}
          >
            <Image
              src={item.url}
              alt={item.alt}
              width={100}
              height={75}
              unoptimized
            />
            <label>
              Texto alternativo
              <input
                value={item.alt}
                maxLength={300}
                onChange={(event) =>
                  setItems(
                    items.map((m) =>
                      m.id === item.id ? { ...m, alt: event.target.value } : m,
                    ),
                  )
                }
              />
            </label>
            <div className="stack">
              <button
                type="button"
                className="button secondary button-small"
                onClick={() => setCover(item.id)}
                aria-pressed={cover === item.id}
              >
                {cover === item.id ? "★ Portada" : "Elegir portada"}
              </button>
              <button
                type="button"
                className="button secondary button-small"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Mover imagen ${index + 1} arriba`}
              >
                Subir
              </button>
              <button
                type="button"
                className="button secondary button-small"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Mover imagen ${index + 1} abajo`}
              >
                Bajar
              </button>
              <button
                type="button"
                className="button secondary button-small"
                onClick={() => {
                  const next = items.filter((m) => m.id !== item.id);
                  setItems(next);
                  if (cover === item.id) setCover("");
                }}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
      {
        <button
          type="button"
          className="button secondary"
          onClick={save}
          disabled={pending || uploading}
        >
          {pending ? "Guardando…" : "Guardar imágenes y portada"}
        </button>
      }
    </section>
  );
}
