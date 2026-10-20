import { Gallery } from "./gallery";
export function ProjectGallery({
  images,
  coverId,
  linkUrl,
  linkText,
}: {
  images: { id: string; url: string; alt: string }[];
  coverId: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
}) {
  const sorted = [...images].sort(
    (a, b) => Number(b.id === coverId) - Number(a.id === coverId),
  );
  const valid =
    linkUrl && /^https?:\/\//.test(linkUrl) && URL.canParse(linkUrl);
  return (
    <div className="project-gallery">
      <Gallery images={sorted} />
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
