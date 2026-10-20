"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
const MotionContext = createContext({
  animated: true,
  reduced: false,
});
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
export function useAtmosphereMotion() {
  return useContext(MotionContext);
}
export function AtmosphereProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  );
  const animated = !reduced;
  return (
    <MotionContext.Provider
      value={{
        animated: animated && visible,
        reduced,
      }}
    >
      <div
        className="atmosphere-shell"
        data-effects="full"
        data-motion={animated ? "full" : "reduced"}
        data-visible={visible}
      >
        <div className="atmosphere" aria-hidden="true">
          <div className="aurora aurora-cyan" />
          <div className="aurora aurora-blue" />
          <div className="aurora aurora-deepblue" />
          <div className="atmosphere-grain" />
          <svg
            className="dream-ribbons"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              className="ribbon ribbon-one"
              d="M-120 650 C180 110 450 1080 750 420 S1250 140 1600 370"
            />
            <path
              className="ribbon ribbon-two"
              d="M-120 710 C220 240 480 1030 810 490 S1280 180 1600 450"
            />
            <circle cx="180" cy="220" r="7" />
            <circle cx="1170" cy="630" r="5" />
            <circle cx="850" cy="140" r="4" />
          </svg>
          <div className="atmosphere-spark spark-one">✦</div>
          <div className="atmosphere-spark spark-two">✧</div>
          <div className="atmosphere-spark spark-three">✦</div>
        </div>
        <div className="atmosphere-content">{children}</div>
      </div>
    </MotionContext.Provider>
  );
}
