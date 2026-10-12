import { NextResponse, type NextRequest } from "next/server";

import { getAuthRedirect } from "@/lib/auth/routes";
import { DEMO_COOKIE } from "@/lib/demo/mode";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every page request (Next.js 16 renamed "middleware" to "proxy").
 *
 * 1. Refreshes the Supabase session cookie if the access token has expired.
 * 2. Redirects logged-out visitors away from private pages (unless they're in
 *    demo mode), and logged-in users away from the landing/login pages.
 *
 * This is a convenience layer for navigation, not the security boundary: data is
 * protected by row-level security in the database and by session checks in every
 * Server Action.
 */
export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const redirectTo = getAuthRedirect(pathname, search, {
    isLoggedIn: userId !== null,
    isDemo: request.cookies.get(DEMO_COOKIE)?.value === "1",
  });
  if (redirectTo) {
    const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));
    // Keep any refreshed auth cookies when redirecting.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }
  return response;
}

export const config = {
  matcher: [
    // Every path except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
