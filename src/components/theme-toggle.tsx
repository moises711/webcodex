"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema claro u oscuro"
    >
      <Sun size={18} className="sun" />
      <Moon size={18} className="moon" />
      <span>Tema</span>
    </button>
  );
}
