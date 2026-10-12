import { cn } from "@/lib/utils";

/** A form-level error or success message, announced to screen readers when it appears. */
export function FormAlert({ error, message }: { error?: string; message?: string }) {
  const text = error ?? message;
  if (!text) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        error
          ? "border-destructive/50 text-destructive"
          : "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {text}
    </p>
  );
}
