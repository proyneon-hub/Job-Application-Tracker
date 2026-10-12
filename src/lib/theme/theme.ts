// Theme preference: "light", "dark", or "system" (follow the operating system).
// Stored in localStorage and applied by adding the "dark" class to <html>.

export const THEME_STORAGE_KEY = "jat-theme";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/**
 * Runs in <head> before the page paints, so a dark-mode user never sees a white
 * flash. Kept tiny and dependency-free on purpose; it must be plain ES5 because it
 * isn't processed by the bundler.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var c=document.documentElement.classList;if(d){c.add("dark")}else{c.remove("dark")}document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** Applies a theme to the page and remembers it. */
export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
}

/** The theme a button press switches to: system -> light -> dark -> system. */
export function nextTheme(theme: Theme): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]!;
}
