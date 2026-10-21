import { PublicHero } from "@/components/public/public-hero";
import {
  SearchForm,
  ProjectList,
  type Filters,
} from "@/components/public/project-list";
export const metadata = {
  title: "Buscar proyectos",
  robots: { index: false, follow: true },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  return (
    <div className="container section">
      <PublicHero>
        <p className="eyebrow">EXPLORA EL PORTAFOLIO</p>
        <h1>Encuentra una solución</h1>
      </PublicHero>

      <SearchForm filters={filters} path="/buscar" />
      <ProjectList filters={filters} path="/buscar" />
    </div>
  );
}
