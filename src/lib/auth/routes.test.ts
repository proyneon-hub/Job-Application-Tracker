import { describe, expect, it } from "vitest";

import { getAuthRedirect, HOME_PATH, safeNextPath } from "./routes";

describe("getAuthRedirect", () => {
  it("sends logged-out visitors on private pages to login, remembering where they were", () => {
    expect(getAuthRedirect("/applications", "?status=offer", false)).toBe(
      "/login?next=%2Fapplications%3Fstatus%3Doffer",
    );
  });

  it("treats unknown pages as private by default", () => {
    expect(getAuthRedirect("/some-new-page", "", false)).toBe("/login?next=%2Fsome-new-page");
  });

  it("lets logged-out visitors see the landing and auth pages", () => {
    for (const path of ["/", "/login", "/signup", "/forgot-password", "/auth/confirm"]) {
      expect(getAuthRedirect(path, "", false)).toBeNull();
    }
  });

  it("sends logged-in users away from the landing and login pages", () => {
    for (const path of ["/", "/login", "/signup", "/forgot-password"]) {
      expect(getAuthRedirect(path, "", true)).toBe(HOME_PATH);
    }
  });

  it("lets logged-in users through to private pages", () => {
    expect(getAuthRedirect("/dashboard", "", true)).toBeNull();
    expect(getAuthRedirect("/reset-password", "", true)).toBeNull();
  });

  it("requires a session for the reset-password page", () => {
    expect(getAuthRedirect("/reset-password", "", false)).toBe("/login?next=%2Freset-password");
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
