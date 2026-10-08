import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
};

/**
 * A labelled input with its validation errors.
 *
 * The error and hint text are linked to the input with aria-describedby, so screen
 * readers announce them when the field is focused.
 */
export function FormField({ name, label, errors, hint, id = name, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);
  const describedBy = [hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && !hasError ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-sm text-destructive">
          {errors?.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
