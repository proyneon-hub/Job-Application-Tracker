// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyTheme,
  nextTheme,
  readStoredTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
} from "./theme";

function mockSystemDark(dark: boolean) {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: dark }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("theme", () => {
  it("cycles system -> light -> dark -> system", () => {
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
  });

  it("defaults to system and ignores unknown stored values", () => {
    expect(readStoredTheme()).toBe("system");
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    expect(readStoredTheme()).toBe("system");
  });

  it("applies and remembers a theme, following the OS in system mode", () => {
    mockSystemDark(true);
    applyTheme("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(readStoredTheme()).toBe("light");

    applyTheme("system");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("the inline startup script applies the stored theme before paint", () => {
    mockSystemDark(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    // Runs the exact string the page embeds in <head>.
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement).toHaveClass("dark");
  });
});
