import { updateTag, revalidatePath } from "next/cache";
export function refreshCatalog() {
  updateTag("catalog");
  revalidatePath("/");
  revalidatePath("/servicios");
  revalidatePath("/[slug]", "page");
  revalidatePath("/buscar");
  revalidatePath("/servicios/[slug]", "page");
  revalidatePath("/empresa");
  revalidatePath("/panel", "layout");
  revalidatePath("/sitemap.xml");
}
