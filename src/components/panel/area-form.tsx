"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveArea } from "@/server/actions/admin";
import { ActionForm } from "./action-form";
export function AreaForm({
  area,
}: {
  area?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    icon: string | null;
    coverImageUrl: string | null;
    isActive: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
  };
}) {
  const [color, setColor] = useState(area?.color || "#2F86C8");
  const [cover, setCover] = useState(area?.coverImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file || !area) return;
    if (
      !file.size ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setUploadMessage("Usa JPG, PNG o WebP de hasta 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.set("areaId", area.id);
      data.set("alt", area.name);
      data.set("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCover(result.url);
      setUploadMessage("Portada subida y guardada.");
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <ActionForm action={saveArea}>
      {area && <input type="hidden" name="id" value={area.id} />}
      <section className="panel-card">
        <h3>Apariencia en buscadores (SEO)</h3>
        <p className="notice">
          Estos metadatos no aparecen en el diseño. Si están vacíos, se usan el
          nombre y la descripción del servicio. Google puede adaptar el
          resultado a cada búsqueda.
        </p>
        <label>
          Título para buscadores
          <input
            name="seoTitle"
            defaultValue={area?.seoTitle || ""}
            maxLength={160}
            placeholder="Páginas web y software en Cusco, Perú"
          />
        </label>
        <label>
          Descripción para buscadores
          <textarea
            name="seoDescription"
            defaultValue={area?.seoDescription || ""}
            maxLength={300}
          />
        </label>
        <label>
          Palabras clave, separadas por comas
          <input
            name="seoKeywords"
            defaultValue={area?.seoKeywords || ""}
            maxLength={1000}
            placeholder="software, páginas web, Cusco"
          />
        </label>
        <p className="notice">
          Google no utiliza la etiqueta de palabras clave para posicionar.
          Incluye tus servicios de forma natural en el contenido visible.
        </p>
      </section>
      <div className="two-columns">
        <label>
          Nombre
          <input
            name="name"
            defaultValue={area?.name}
            required
            maxLength={100}
          />
        </label>
        <label>
          Slug
          <input
            name="slug"
            defaultValue={area?.slug}
            placeholder="nombre-del-area"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={100}
          />
        </label>
      </div>
      <label>
        Descripción
        <textarea
          name="description"
          defaultValue={area?.description || ""}
          maxLength={2000}
        />
      </label>

      <div className="two-columns">
        <label>
          Color de acento
          <input
            type="color"
            name="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </label>
        <label>
          Ícono
          <select name="icon" defaultValue={area?.icon || "Code2"}>
            <option value="Code2">Sistemas</option>
            <option value="Palette">Marketing y diseño gráfico</option>
            <option value="Headphones">Soporte técnico</option>
            <option value="ShieldCheck">Ciberseguridad</option>
          </select>
        </label>
      </div>
      {area && (
        <div className="panel-card">
          <h3>Imágenes del carrusel y proyectos</h3>
          <p className="notice">
            Agrega imágenes a los proyectos de esta área y publícalos para que
            aparezcan en el carrusel.
          </p>
          <Link
            className="button secondary"
            href={`/panel/proyectos?areaId=${area.id}`}
          >
            Gestionar trabajos y sus fotos
          </Link>
        </div>
      )}
      <section className="area-cover-controls">
        <h3>Imagen de portada</h3>
        <input type="hidden" name="coverImageUrl" value={cover} />
        {cover ? (
          <Image
            src={cover}
            alt={`Portada de ${area?.name || "área"}`}
            width={640}
            height={240}
            unoptimized
            className="area-cover-preview"
          />
        ) : (
          <p className="notice">Sin imagen de portada.</p>
        )}
        <p className="notice">
          JPG, PNG o WebP · máximo 5 MB. La imagen se optimiza automáticamente.
        </p>
        {area ? (
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={uploading}
              onChange={(event) => {
                void upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading
                  ? "Subiendo…"
                  : cover
                    ? "Reemplazar imagen"
                    : "Subir imagen"}
              </button>
              <button
                type="button"
                className="button destructive"
                disabled={!cover || uploading}
                onClick={() => {
                  setCover("");
                  setUploadMessage(
                    "Portada quitada. Pulsa Guardar para aplicar el cambio.",
                  );
                }}
              >
                Quitar imagen
              </button>
            </div>
          </>
        ) : (
          <p className="notice">Crea el área primero para subir su portada.</p>
        )}
        {uploadMessage && <p role="status">{uploadMessage}</p>}
      </section>
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={area?.isActive ?? true}
        />
        Área activa
      </label>
      <div
        className="area-card"
        style={{ "--area-color": color } as React.CSSProperties}
      >
        <strong>Vista previa del acento del área</strong>
        <p>Este color identifica sus tarjetas en el portal.</p>
      </div>
    </ActionForm>
  );
}
