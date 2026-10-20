"use client";
import { useEffect, useRef } from "react";
export function Ambient({
  className,
  children,
  hidden = true,
}: {
  className: string;
  children: React.ReactNode;
  hidden?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let visible = false;
    function update() {
      node!.dataset.active = String(visible && !document.hidden);
    }
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      aria-hidden={hidden || undefined}
      data-active="false"
    >
      {children}
    </div>
  );
}
