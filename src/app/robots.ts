import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/media/"],
      disallow: ["/panel", "/api/", "/ingresar", "/cambiar-clave", "/recuperar", "/restablecer"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
