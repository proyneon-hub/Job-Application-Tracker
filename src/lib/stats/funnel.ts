import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application, StatusEvent } from "@/lib/applications/types";

import { groupEvents } from "./summary";

/** The stages of the funnel, in order. Rejected and Withdrawn end a journey but aren't stages. */
export const FUNNEL_STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
] as const satisfies readonly ApplicationStatus[];

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export type FunnelStep = {
  stage: FunnelStage;
  count: number;
  /** Share of applications that reached Applied, from 0 to 1 (null when none did). */
  shareOfApplied: number | null;
};

function stageIndex(status: ApplicationStatus) {
  return FUNNEL_STAGES.indexOf(status as FunnelStage);
}

/**
 * How many applications ever reached each stage. An application counts for every
 * stage up to the furthest one it reached, so skipping a stage (Applied straight
 * to Interview) still counts as passing through it.
 */
export function getFunnel(applications: Application[], events: StatusEvent[]): FunnelStep[] {
  const histories = groupEvents(events);
  const counts = FUNNEL_STAGES.map(() => 0);

  for (const app of applications) {
    const statuses = [app.status, ...(histories.get(app.id) ?? []).map((e) => e.toStatus)];
    let furthest = Math.max(...statuses.map(stageIndex));
    if (furthest < 0 && app.dateApplied) furthest = 0;
    for (let i = 0; i <= furthest; i += 1) counts[i]! += 1;
  }

  const applied = counts[0]!;
  return FUNNEL_STAGES.map((stage, i) => ({
    stage,
    count: counts[i]!,
    shareOfApplied: applied > 0 ? counts[i]! / applied : null,
  }));
}
