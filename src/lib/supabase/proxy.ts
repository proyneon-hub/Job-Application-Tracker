import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes the user's auth session (if any) and returns the response to send
 * along with the user's id.
 *
 * Runs in src/proxy.ts before every page. Access tokens are short-lived, so this
 * is where an expired token gets swapped for a fresh one and the new cookies are
 * written to both the request (for this render) and the response (for the browser).
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Cache-control headers that stop a CDN from caching a response that sets auth cookies.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Don't put code between createServerClient and getClaims(): getClaims() is what
  // triggers the refresh. It also verifies the token's signature, so unlike
  // getSession() it can be trusted on the server.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub ?? null;

  return { response, userId };
}
