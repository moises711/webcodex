"use client";
import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { usePublicMotion } from "./public-experience";
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { animated } = usePublicMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || !animated) return;
    let animation: ReturnType<typeof animate> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          animation = animate(0, value, {
            duration: 1.1,
            ease: "easeOut",
            onUpdate: (current) => {
              node.textContent = String(Math.round(current));
            },
          });
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      animation?.stop();
      node.textContent = String(value);
    };
  }, [animated, value]);
  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
