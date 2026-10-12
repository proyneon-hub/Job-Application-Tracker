import { cookies } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/actions/auth";
import { DEMO_COOKIE } from "@/lib/demo/mode";
import { createClient } from "@/lib/supabase/server";

import { ExitDemoButton } from "./exit-demo-button";

/**
 * Shows who is logged in, plus a log out button (or the demo-mode equivalent).
 * Reads the session, so render it inside <Suspense>.
 */
export async function UserMenu() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data && (await cookies()).get(DEMO_COOKIE)?.value === "1") {
    return (
      <div className="flex items-center gap-3">
        {/* Hidden on phones to save space; the Exit demo button already says it. */}
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Demo mode
        </Badge>
        <ExitDemoButton />
      </div>
    );
  }

  const email = data?.claims.email;
  return (
    <div className="flex items-center gap-3">
      {email ? (
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
      ) : null}
      <form action={logOut}>
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </div>
  );
}
