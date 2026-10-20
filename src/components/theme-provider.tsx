"use client";
import { ThemeProvider as Provider } from "next-themes";
export function ThemeProvider({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  return (
    <Provider
      nonce={nonce}
      attribute="data-theme"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      storageKey="codex-blue-theme"
    >
      {children}
    </Provider>
  );
}
