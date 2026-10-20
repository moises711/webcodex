"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function LoginShortcut() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const held = new Set<string>();
    function reset() {
      held.clear();
    }
    function keydown(event: KeyboardEvent) {
      const target =
        event.target instanceof Element ? event.target : document.activeElement;
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        target?.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]',
        )
      ) {
        reset();
        return;
      }
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key !== "a" && key !== "s") {
        reset();
        return;
      }
      held.add(key);
      if (held.has("a") && held.has("s")) {
        event.preventDefault();
        reset();
        router.push("/ingresar");
      }
    }
    function keyup(event: KeyboardEvent) {
      held.delete(event.key.toLowerCase());
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    document.addEventListener("focusin", reset);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      document.removeEventListener("focusin", reset);
    };
  }, [router, pathname]);
  return null;
}
