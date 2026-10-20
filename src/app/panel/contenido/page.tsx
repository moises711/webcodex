import { getPanelAreas } from "@/server/queries/panel";
import { ContentAreas } from "@/components/panel/content-areas";
export default async function Page() {
  const areas = await getPanelAreas();
  return (
    <>
      <h1>Crear contenido</h1>
      <ContentAreas areas={areas} />
    </>
  );
}
