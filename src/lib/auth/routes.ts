/** Where people land after logging in. */
export const HOME_PATH = "/dashboard";

/** Pages for logged-out visitors. Logged-in users are sent to HOME_PATH instead. */
const GUEST_ONLY_PATHS = ["/", "/login", "/signup", "/forgot-password"];

/** Paths anyone can visit, logged in or not. */
const PUBLIC_PATH_PREFIXES = ["/auth/", "/demo"];

/** Pages that need a real account, even in demo mode. */
const ACCOUNT_ONLY_PATHS = ["/reset-password"];

function isGuestOnly(pathname: string) {
  return GUEST_ONLY_PATHS.includes(pathname);
}

function isPublic(pathname: string) {
  return isGuestOnly(pathname) || PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

type Visitor = {
  /** Has a real, verified Supabase session. */
  isLoggedIn: boolean;
  /** Has the demo-mode cookie (see src/lib/demo/mode.ts). */
  isDemo: boolean;
};

/**
 * Decides whether a request should be redirected, based only on the path and who
 * is visiting. Returns the URL path to redirect to, or null.
 *
 * Every page not listed above is protected: new pages are private by default.
 * Demo visitors may open app pages; they only ever see data stored in their own browser.
 */
export function getAuthRedirect(pathname: string, search: string, { isLoggedIn, isDemo }: Visitor) {
  if (isLoggedIn) {
    return isGuestOnly(pathname) ? HOME_PATH : null;
  }
  if (isPublic(pathname)) {
    return null;
  }
  if (isDemo && !ACCOUNT_ONLY_PATHS.includes(pathname)) {
    return null;
  }
  const next = encodeURIComponent(pathname + search);
  return `/login?next=${next}`;
}

/**
 * Only allows redirects to paths on this site, never to other domains.
 * Stops "open redirect" tricks like /login?next=https://evil.example or ?next=//evil.example.
 */
export function safeNextPath(next: string | null | undefined, fallback = HOME_PATH) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
