import "server-only";

import { cookies } from "next/headers";

import { DEMO_COOKIE } from "@/lib/demo/mode";
import { createClient } from "@/lib/supabase/server";

/**
 * Who is viewing the page: a logged-in user (with their email), a demo visitor, or neither.
 * A real session always wins over a leftover demo cookie.
 * Reads cookies, so call it from a component inside <Suspense>.
 */
export async function getVisitor() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data) {
    return { kind: "user" as const, email: data.claims.email ?? null };
  }
  if ((await cookies()).get(DEMO_COOKIE)?.value === "1") {
    return { kind: "demo" as const };
  }
  return { kind: "guest" as const };
}
