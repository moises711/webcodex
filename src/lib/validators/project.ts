import { isSafeRichContent } from "../rich-content-validation";
import { z } from "zod";
export const projectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Escribe un título de al menos 3 caracteres")
      .max(160),
    summary: z.string().trim().min(1, "Escribe un resumen").max(200),
    areaId: z.string().cuid(),
    type: z.enum(["PROJECT", "SYSTEM", "WEBSITE"]),
    workDate: z.union([z.iso.date(), z.literal("")]).optional(),
    year: z.number().int().min(1900).max(2200).nullable(),
    tags: z.string().max(1000),
    techStack: z.string().max(1000),
    isFeatured: z.boolean(),
    coverLinkUrl: z
      .string()
      .max(2000)
      .optional()
      .refine(
        (v) => !v || (/^https?:\/\//.test(v) && URL.canParse(v)),
        "Usa un enlace http:// o https:// válido",
      ),
    coverLinkText: z.string().trim().max(100).optional(),
    content: z
      .unknown()
      .refine(
        isSafeRichContent,
        "El contenido no es válido o supera el tamaño permitido",
      ),
    systemName: z.string().max(160),
    systemUrl: z.string().max(2000),
    environment: z.enum(["demo", "produccion"]),
    credentialVisibility: z.enum(["PUBLIC", "INTERNAL", "HIDDEN"]),
    credentials: z
      .array(
        z.object({
          id: z.string().cuid().optional(),
          label: z.string().trim().min(1).max(100),
          username: z.string().trim().min(1).max(200),
          password: z.string().max(500),
          notes: z.string().max(1000),
          isActive: z.boolean(),
        }),
      )
      .max(20),
  })
  .superRefine((value, ctx) => {
    if (
      value.type !== "WEBSITE" &&
      !!value.coverLinkUrl !== !!value.coverLinkText?.trim()
    )
      ctx.addIssue({
        code: "custom",
        path: ["coverLinkText"],
        message: "Completa el enlace y el texto del botón, o deja ambos vacíos",
      });
    if (value.type === "WEBSITE" && !value.coverLinkUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["coverLinkUrl"],
        message: "Agrega el enlace de la página web",
      });
    }
    if (value.type === "SYSTEM") {
      value.credentials.forEach((credential, index) => {
        if (!z.email().safeParse(credential.username).success)
          ctx.addIssue({
            code: "custom",
            path: ["credentials", index, "username"],
            message: "Escribe un correo electrónico válido para el acceso demo",
          });
      });
      if (!value.systemName.trim())
        ctx.addIssue({
          code: "custom",
          path: ["systemName"],
          message: "Escribe el nombre del sistema",
        });
      try {
        const u = new URL(value.systemUrl);
        if (u.protocol !== "https:") throw new Error();
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["systemUrl"],
          message: "Usa una URL https:// válida",
        });
      }
    }
  });
export type ProjectInput = z.infer<typeof projectSchema>;
export function parseList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ]
    .slice(0, 20)
    .map((x) => x.slice(0, 50));
}
