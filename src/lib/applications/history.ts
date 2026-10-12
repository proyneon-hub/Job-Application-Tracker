import { STATUS_LABELS } from "./constants";
import type { StatusEvent } from "./types";

/** "Added as Wishlist" for the first entry, "Applied → Screening" for later ones. */
export function describeStatusEvent(event: Pick<StatusEvent, "fromStatus" | "toStatus">) {
  if (event.fromStatus === null) return `Added as ${STATUS_LABELS[event.toStatus]}`;
  return `${STATUS_LABELS[event.fromStatus]} → ${STATUS_LABELS[event.toStatus]}`;
}
