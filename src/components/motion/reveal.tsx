"use client";
import { useEffect, useRef } from "react";
import { usePublicMotion } from "./public-experience";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const { animated } = usePublicMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || !animated || played.current) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          played.current = true;
          animation = node.animate(
            [
              { opacity: 0.55, transform: "translateY(10px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 380,
              delay: Math.min(Math.max(delay, 0), 0.3) * 1000,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
          );
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      animation?.cancel();
      node.style.removeProperty("opacity");
      node.style.removeProperty("transform");
    };
  }, [animated, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
