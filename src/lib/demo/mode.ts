/**
 * Demo mode is switched on by this cookie. It isn't sensitive: it only lets a
 * visitor see the app's pages, which then read demo data from their own browser.
 * It grants no access to any real data (Server Actions and the database still
 * require a real login, enforced by row-level security).
 */
export const DEMO_COOKIE = "jat_demo";

/** True in the browser when demo mode is on. Always false on the server. */
export function isDemoModeInBrowser() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${DEMO_COOKIE}=1`);
}
