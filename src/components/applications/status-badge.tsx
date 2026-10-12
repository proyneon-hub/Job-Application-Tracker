import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications/constants";
import { cn } from "@/lib/utils";

// Colour is a hint only; the label text always says the status, so it works
// for colour-blind users and screen readers too.
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  wishlist: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  applied: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
  screening: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100",
  interview: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  offer: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  rejected: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  withdrawn: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
