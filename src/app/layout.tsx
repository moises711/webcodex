import { requestNonce } from "@/lib/nonce";
import { MobileNavigation } from "@/components/public/mobile-navigation";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import localFont from "next/font/local";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AtmosphereProvider } from "@/components/motion/atmosphere-provider";
import "./globals.css";
import "@/styles/motion.css";
import "@/styles/atmosphere.css";
import "@/styles/panel.css";
import "@/styles/buttons.css";
import "@/styles/content-cards.css";
const titleFont = localFont({
  src: "./fonts/alice.ttf",
  weight: "400",
  variable: "--font-title",
  display: "swap",
});
const subtitleFont = localFont({
  src: "./fonts/pompiere.ttf",
  weight: "400",
  variable: "--font-subtitle",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Códex Cusco | Software, páginas web y marketing en Cusco",
    template: "%s | Códex Cusco",
  },
  icons: {
    icon: [
      { url: "/resources/images/codex-cusco-icon.png", type: "image/png" },
    ],
    shortcut: "/resources/images/codex-cusco-icon.png",
    apple: "/resources/images/codex-cusco-icon.png",
  },
  description:
    "Desarrollo de software y páginas web, marketing digital, ciberseguridad y soporte técnico en Cusco, Perú. Soluciones digitales para tu negocio.",
  openGraph: {
    title: "Códex Cusco",
    description: "Proyectos y sistemas de nuestros equipos",
    images: ["/resources/images/codex-cusco.jpeg"],
    locale: "es_PE",
    type: "website",
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = await requestNonce();
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${mono.variable} ${titleFont.variable} ${subtitleFont.variable}`}
    >
      <body>
        <ThemeProvider nonce={nonce}>
          <AtmosphereProvider>
            {children}
            <MobileNavigation />
          </AtmosphereProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
