"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WeekCount } from "@/lib/stats/weekly";

const CHART_HEIGHT = 160;

function weekLabel(weekStart: string) {
  // "Oct 5" (drop the year to keep axis labels short).
  return formatDate(weekStart).replace(/, \d{4}$/, "");
}

function plural(count: number) {
  return `${count} ${count === 1 ? "application" : "applications"}`;
}

/**
 * Column chart of applications per week. Hovering a column shows its value; the
 * same numbers are available to everyone (keyboard and screen readers included)
 * through the "Show as table" toggle.
 */
export function WeeklyChart({ weeks }: { weeks: WeekCount[] }) {
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const max = Math.max(...weeks.map((w) => w.count));
  // A clean top for the axis: at least 1, rounded up to an even number above 4.
  const top = max <= 4 ? Math.max(max, 1) : Math.ceil(max / 2) * 2;
  const total = weeks.reduce((sum, w) => sum + w.count, 0);

  return (
    <figure className="grid gap-4 rounded-xl border bg-card p-4">
      <figcaption className="flex flex-wrap items-start justify-between gap-2">
        <div className="grid gap-0.5">
          <h2 className="text-lg font-semibold">Applications per week</h2>
          <p className="text-sm text-muted-foreground">
            Last {weeks.length} weeks, by date applied · {plural(total)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={showTable}
          aria-controls={tableId}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? "Show as chart" : "Show as table"}
        </Button>
      </figcaption>

      {showTable ? (
        <table id={tableId} className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-1 font-medium">Week of</th>
              <th className="py-1 text-right font-medium">Applications</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {weeks.map((w) => (
              <tr key={w.weekStart} className="border-b last:border-0">
                <td className="py-1">{formatDate(w.weekStart)}</td>
                <td className="py-1 text-right">{w.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          role="img"
          aria-label={`Column chart: ${weeks.map((w) => `week of ${weekLabel(w.weekStart)}, ${plural(w.count)}`).join("; ")}.`}
          className="grid grid-cols-[auto_1fr] gap-x-2"
        >
          {/* Y axis: just the top and zero, as the tooltip and table carry exact values. */}
          <div
            className="flex flex-col justify-between text-xs text-muted-foreground tabular-nums"
            style={{ height: CHART_HEIGHT }}
            aria-hidden="true"
          >
            <span className="-translate-y-1/2">{top}</span>
            <span className="translate-y-1/2">0</span>
          </div>
          <div className="relative" style={{ height: CHART_HEIGHT }} aria-hidden="true">
            {/* Recessive hairline gridline at the top, solid baseline at zero. */}
            <div className="absolute inset-x-0 top-0 border-t border-border" />
            <div className="absolute inset-x-0 bottom-0 border-t border-border" />
            <div className="absolute inset-0 flex items-end">
              {weeks.map((w, i) => (
                // The whole column slot is the hover target, not just the (maybe tiny) bar.
                <div
                  key={w.weekStart}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <div
                    className="relative w-full max-w-6 rounded-t bg-viz-1 group-hover:opacity-80"
                    style={{ height: `${(w.count / top) * 100}%` }}
                  >
                    {/* Sits just above the bar; edge columns align inward so it never overflows. */}
                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block",
                        i === 0
                          ? "left-0"
                          : i === weeks.length - 1
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <strong className="font-semibold">{w.count}</strong> · week of{" "}
                      {weekLabel(w.weekStart)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div />
          <div className="mt-1 flex text-xs text-muted-foreground" aria-hidden="true">
            {weeks.map((w, i) => (
              <span
                key={w.weekStart}
                // On narrow screens, label every other week so labels don't collide.
                className={cn(
                  "flex-1 text-center whitespace-nowrap",
                  i % 2 === 1 && "max-sm:invisible",
                )}
              >
                {weekLabel(w.weekStart)}
              </span>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}
