import { NextResponse, type NextRequest } from "next/server";

import { HOME_PATH } from "@/lib/auth/routes";
import { DEMO_COOKIE } from "@/lib/demo/mode";
import { createClient } from "@/lib/supabase/server";

/**
 * "Try the demo": switches on demo mode and opens the dashboard.
 *
 * POST, not GET, because it changes state: a GET could be triggered by link
 * prefetching or crawlers. The landing page submits a plain form here.
 */
export async function POST(request: NextRequest) {
  // 303 makes the browser follow up with a GET to the dashboard.
  const response = NextResponse.redirect(new URL(HOME_PATH, request.url), 303);

  // Someone already logged in keeps using their real account.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data) return response;

  response.cookies.set(DEMO_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 30,
    // Readable by JavaScript on purpose: the browser decides whether to load demo data.
    httpOnly: false,
  });
  return response;
}
