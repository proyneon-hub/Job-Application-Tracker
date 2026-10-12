import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ControlProps = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldShellProps = {
  id: string;
  label: string;
  errors?: string[];
  hint?: string;
  /** Renders the control, given the props that link it to its label and messages. */
  children: (controlProps: ControlProps) => React.ReactNode;
};

/**
 * Label + any control + hint + validation errors.
 *
 * The error and hint text are linked to the control with aria-describedby, so screen
 * readers announce them when the field is focused.
 */
export function FieldShell({ id, label, errors, hint, children }: FieldShellProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);
  const describedBy = [hint && !hasError ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": hasError ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
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

type FormFieldProps = React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
};

/** A labelled text input with its validation errors. */
export function FormField({ name, label, errors, hint, id = name, ...inputProps }: FormFieldProps) {
  return (
    <FieldShell id={id} label={label} errors={errors} hint={hint}>
      {(controlProps) => <Input name={name} {...inputProps} {...controlProps} />}
    </FieldShell>
  );
}
