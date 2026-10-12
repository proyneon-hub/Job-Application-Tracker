import { STATUS_LABELS } from "@/lib/applications/constants";
import type { FunnelStep } from "@/lib/stats/funnel";

function percent(share: number | null) {
  return share === null ? "" : `${Math.round(share * 100)}%`;
}

/**
 * Horizontal bars: how many applications reached each stage. Every value is
 * written at the bar's tip, so nothing depends on hovering or on colour.
 */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));

  return (
    <figure className="grid gap-4 rounded-xl border bg-card p-4">
      <figcaption className="grid gap-0.5">
        <h2 className="text-lg font-semibold">Funnel by stage</h2>
        <p className="text-sm text-muted-foreground">
          Applications that reached each stage, and the share of everything you applied to
        </p>
      </figcaption>
      <ol className="grid gap-3">
        {steps.map((step) => (
          <li key={step.stage} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm">
            <span className="text-muted-foreground">{STATUS_LABELS[step.stage]}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-5 rounded-r bg-viz-1"
                style={{ width: `${(step.count / max) * 100}%`, minWidth: step.count > 0 ? 4 : 0 }}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap tabular-nums">
                <strong className="font-semibold">{step.count}</strong>
                {step.stage !== "applied" && step.shareOfApplied !== null ? (
                  <span className="text-muted-foreground"> · {percent(step.shareOfApplied)}</span>
                ) : null}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
