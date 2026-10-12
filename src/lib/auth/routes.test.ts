import { describe, expect, it } from "vitest";

import { getAuthRedirect, HOME_PATH, safeNextPath } from "./routes";

const guest = { isLoggedIn: false, isDemo: false };
const user = { isLoggedIn: true, isDemo: false };
const demo = { isLoggedIn: false, isDemo: true };

describe("getAuthRedirect", () => {
  it("sends logged-out visitors on private pages to login, remembering where they were", () => {
    expect(getAuthRedirect("/applications", "?status=offer", guest)).toBe(
      "/login?next=%2Fapplications%3Fstatus%3Doffer",
    );
  });

  it("treats unknown pages as private by default", () => {
    expect(getAuthRedirect("/some-new-page", "", guest)).toBe("/login?next=%2Fsome-new-page");
  });

  it("lets logged-out visitors see the landing and auth pages", () => {
    for (const path of ["/", "/login", "/signup", "/forgot-password", "/auth/confirm", "/demo"]) {
      expect(getAuthRedirect(path, "", guest)).toBeNull();
    }
  });

  it("sends logged-in users away from the landing and login pages", () => {
    for (const path of ["/", "/login", "/signup", "/forgot-password"]) {
      expect(getAuthRedirect(path, "", user)).toBe(HOME_PATH);
    }
  });

  it("lets logged-in users through to private pages", () => {
    expect(getAuthRedirect("/dashboard", "", user)).toBeNull();
    expect(getAuthRedirect("/reset-password", "", user)).toBeNull();
  });

  it("requires a session for the reset-password page", () => {
    expect(getAuthRedirect("/reset-password", "", guest)).toBe("/login?next=%2Freset-password");
  });

  it("lets demo visitors open app pages, but not account-only pages", () => {
    expect(getAuthRedirect("/board", "", demo)).toBeNull();
    expect(getAuthRedirect("/applications/abc", "", demo)).toBeNull();
    expect(getAuthRedirect("/", "", demo)).toBeNull();
    expect(getAuthRedirect("/reset-password", "", demo)).toBe("/login?next=%2Freset-password");
  });

  it("treats a logged-in user with a leftover demo cookie as logged in", () => {
    expect(getAuthRedirect("/login", "", { isLoggedIn: true, isDemo: true })).toBe(HOME_PATH);
  });
});

describe("safeNextPath", () => {
  it("allows paths on this site", () => {
    expect(safeNextPath("/applications?status=offer")).toBe("/applications?status=offer");
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "dashboard",
  ])("falls back for %s", (value) => {
    expect(safeNextPath(value)).toBe(HOME_PATH);
  });
});
