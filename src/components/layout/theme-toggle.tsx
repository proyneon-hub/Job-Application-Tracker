"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { applyTheme, nextTheme, readStoredTheme, type Theme } from "@/lib/theme/theme";

const LABELS: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };
const ICONS = { system: Monitor, light: Sun, dark: Moon };

// The server can't know the stored theme, so it renders nothing in the button's
// place; useSyncExternalStore swaps in the real button straight after hydration
// without a hydration mismatch. (The page colours themselves are already correct:
// the inline script in the root layout set them before paint.)
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function ThemeToggle() {
  const isClient = useIsClient();
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : readStoredTheme(),
  );

  // In system mode, follow the OS live if the user switches it while the page is open.
  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  if (!isClient) return <div className="size-8" aria-hidden="true" />;

  const Icon = ICONS[theme];
  const next = nextTheme(theme);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]}.`}
      title={`Theme: ${LABELS[theme]}`}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
