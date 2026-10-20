"use client";
import { useEffect, useState, type RefObject } from "react";
import { useAtmosphereMotion } from "@/components/motion/atmosphere-provider";
export function useCarousel(
  count: number,
  root: RefObject<HTMLDivElement | null>,
) {
  const [slide, setSlide] = useState({ position: 0, previous: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const { animated, reduced } = useAtmosphereMotion();
  const playing = count > 1 && !paused && !hovered && animated && inView;
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) =>
      setInView(entries.some((entry) => entry.isIntersecting)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [count, root]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        setSlide((value) => ({
          previous: value.position,
          position: (value.position + 1) % count,
        })),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [count, playing]);
  function move(offset: number) {
    setSlide((value) => ({
      previous: value.position,
      position: (value.position + offset + count) % count,
    }));
    setPaused(true);
  }
  return {
    index: count ? slide.position % count : 0,
    previousIndex: count ? slide.previous % count : 0,
    paused,
    setPaused,
    setHovered,
    playing,
    reduced,
    move,
    select: (index: number) => {
      setSlide((value) => ({ previous: value.position, position: index }));
      setPaused(true);
    },
  };
}
