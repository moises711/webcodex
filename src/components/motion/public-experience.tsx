"use client";
import { motion, useScroll } from "motion/react";
import { useAtmosphereMotion } from "./atmosphere-provider";
export const usePublicMotion = useAtmosphereMotion;
export function PublicExperience({ children }: { children: React.ReactNode }) {
  const { animated } = usePublicMotion();
  const { scrollYProgress } = useScroll();
  return (
    <div
      className="public-experience"
      data-motion={animated ? "full" : "reduced"}
    >
      <motion.div
        className="reading-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
