import { ServiceInfoCard } from "./service-info-card";

export function ServiceContent({ slug }: { slug: string }) {
  return <ServiceInfoCard slug={slug} />;
}
