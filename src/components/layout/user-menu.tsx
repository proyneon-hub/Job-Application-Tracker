import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

/** Shows who is logged in, plus a log out button. Reads the session, so render it inside <Suspense>. */
export async function UserMenu() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
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
