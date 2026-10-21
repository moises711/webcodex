import { descriptiveImageAlt } from "@/lib/image-alt";
import { Gallery } from "./gallery";
export function ProjectGallery({
  images,
  coverId,
  linkUrl,
  linkText,
  projectTitle = "proyecto de Códex Cusco",
}: {
  images: { id: string; url: string; alt: string }[];
  coverId: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  projectTitle?: string;
}) {
  const sorted = [...images].sort(
    (a, b) => Number(b.id === coverId) - Number(a.id === coverId),
  );
  const valid =
    linkUrl && /^https?:\/\//.test(linkUrl) && URL.canParse(linkUrl);
  return (
    <div className="project-gallery">
      <Gallery images={sorted.map((image, index) => ({...image, alt: descriptiveImageAlt(image.alt, `${projectTitle}: imagen ${index + 1}`)}))} />
      {valid && linkText && (
        <a
          className={`button primary project-cover-link ${images.length ? "has-image" : ""}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}
