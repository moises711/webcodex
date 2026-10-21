import { permanentRedirect, notFound } from "next/navigation";
const aliases: Record<string, string> = {"sistemas-software-web":"sistemas", "marketing-diseno":"marketing", "ciberseguridad":"ciberseguridad", "soporte-tecnico":"soporte-tecnico", "sistemas":"sistemas", "marketing":"marketing"};
export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const target = aliases[(await params).slug];
  if (!target) notFound();
  permanentRedirect(`/${target}`);
}
