import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/actions/auth";
import { getVisitor } from "@/lib/auth/visitor";

/**
 * Shows who is logged in, plus a log out button. In demo mode it shows nothing:
 * the demo banner has its own actions. Reads the session, so render it inside <Suspense>.
 */
export async function UserMenu() {
  const visitor = await getVisitor();
  if (visitor.kind !== "user") return null;

  return (
    <div className="flex items-center gap-3">
      {visitor.email ? (
        <span className="hidden text-sm text-muted-foreground sm:inline">{visitor.email}</span>
      ) : null}
      <form action={logOut}>
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </div>
  );
}
