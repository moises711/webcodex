import type { NextConfig } from "next";
const storageUrl = process.env.STORAGE_PUBLIC_URL
  ? new URL(process.env.STORAGE_PUBLIC_URL)
  : null;
const nextConfig: NextConfig = {
  output: "standalone",
  deploymentId:
    process.env.NEXT_DEPLOYMENT_ID || "hostinger-runtime-repair-20261020",
  outputFileTracingIncludes: {
    "/api/proformas": [
      "./src/server/pdf/fonts/*",
      "./src/app/globals.css",
      "./public/resources/images/codex-cusco-logo.png",
    ],
  },
  poweredByHeader: false,
  experimental: {
    agentFeedback: true,
    proxyClientMaxBodySize: "6mb",
    serverActions: { bodySizeLimit: "256kb" },
  },
  images: {
    remotePatterns: storageUrl
      ? [
          {
            protocol: storageUrl.protocol.replace(":", "") as "https",
            hostname: storageUrl.hostname,
            port: storageUrl.port,
            pathname: `${storageUrl.pathname.replace(/\/$/, "")}/**`,
          },
        ]
      : [],
  },
  async redirects() {
    return [
      { source: "/areas", destination: "/servicios", permanent: true },
      { source: "/areas/:slug", destination: "/:slug", permanent: true },
      ...[
        ["sistemas-software-web", "sistemas"],
        ["marketing-diseno", "marketing"],
        ["ciberseguridad", "ciberseguridad"],
        ["soporte-tecnico", "soporte-tecnico"],
      ].map(([oldSlug, slug]) => ({
        source: `/servicios/${oldSlug}`,
        destination: `/${slug}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(!dev && process.env.APP_URL?.startsWith("https://")
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
            : []),
        ],
      },
      ...["/ingresar", "/recuperar", "/restablecer", "/cambiar-clave"].map(
        (source) => ({
          source,
          headers: [
            { key: "Cache-Control", value: "private, no-store" },
            { key: "Referrer-Policy", value: "no-referrer" },
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
          ],
        }),
      ),
      {
        source: "/technologies/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/panel/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};
export default nextConfig;
