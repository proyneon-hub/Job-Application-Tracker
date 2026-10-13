import type { ResumeStat } from "@/lib/stats/by-resume";

function percent(rate: number | null) {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

/**
 * Response rate per resume version, as a table so every number is readable
 * without hovering. The bar is a visual aid on a fixed 0–100% scale (one series,
 * so no legend); the percentage beside it carries the value.
 */
export function ResumeStats({ stats }: { stats: ResumeStat[] }) {
  return (
    <figure className="grid gap-4 rounded-xl border bg-card p-4">
      <figcaption className="grid gap-0.5">
        <h2 className="text-lg font-semibold">Response rate by resume</h2>
        <p className="text-sm text-muted-foreground">
          Of the applications sent with each version, how many got a reply (including rejections)
        </p>
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th scope="col" className="pr-3 pb-2 font-medium">
                Resume
              </th>
              <th scope="col" className="px-3 pb-2 text-right font-medium">
                Sent
              </th>
              <th scope="col" className="px-3 pb-2 text-right font-medium">
                Replies
              </th>
              <th scope="col" className="pb-2 pl-3 font-medium">
                Response rate
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr key={row.resumeId ?? "none"} className="border-t">
                <th
                  scope="row"
                  className={
                    row.resumeId === null
                      ? "py-2 pr-3 text-left font-normal text-muted-foreground"
                      : "py-2 pr-3 text-left font-medium"
                  }
                >
                  {row.name}
                </th>
                <td className="px-3 py-2 text-right tabular-nums">{row.sent}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.responded}</td>
                <td className="py-2 pl-3">
                  <div className="flex min-w-36 items-center gap-2">
                    <div className="h-3 flex-1 rounded-sm bg-muted" aria-hidden="true">
                      <div
                        className="h-3 rounded-sm bg-viz-1"
                        style={{
                          width: `${(row.responseRate ?? 0) * 100}%`,
                          minWidth: row.responded > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-semibold tabular-nums">
                      {percent(row.responseRate)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
