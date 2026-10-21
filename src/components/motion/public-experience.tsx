"use client";
import { useAtmosphereMotion } from "./atmosphere-provider";
export const usePublicMotion = useAtmosphereMotion;
export function PublicExperience({ children }: { children: React.ReactNode }) {
  const { animated } = usePublicMotion();
  return (
    <div
      className="public-experience"
      data-motion={animated ? "full" : "reduced"}
    >
      <div className="reading-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
