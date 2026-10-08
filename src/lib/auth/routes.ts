/** Where people land after logging in. */
export const HOME_PATH = "/dashboard";

/** Pages for logged-out visitors. Logged-in users are sent to HOME_PATH instead. */
const GUEST_ONLY_PATHS = ["/", "/login", "/signup", "/forgot-password"];

/** Paths anyone can visit, logged in or not. */
const PUBLIC_PATH_PREFIXES = ["/auth/"];

function isGuestOnly(pathname: string) {
  return GUEST_ONLY_PATHS.includes(pathname);
}

function isPublic(pathname: string) {
  return isGuestOnly(pathname) || PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Decides whether a request should be redirected, based only on the path and
 * whether there's a logged-in user. Returns the URL path to redirect to, or null.
 *
 * Every page not listed above is protected: new pages are private by default.
 */
export function getAuthRedirect(pathname: string, search: string, isLoggedIn: boolean) {
  if (isLoggedIn && isGuestOnly(pathname)) {
    return HOME_PATH;
  }
  if (!isLoggedIn && !isPublic(pathname)) {
    const next = encodeURIComponent(pathname + search);
    return `/login?next=${next}`;
  }
  return null;
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
