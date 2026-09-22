import { cn } from "@/lib/cn";

type Tone = "neutral" | "info" | "success" | "caution" | "error";

const TONE_STYLES: Record<Tone, string> = {
  neutral: "bg-inset text-text-secondary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  caution: "bg-caution/10 text-caution",
  error: "bg-error/10 text-error",
};

// Maps a record's raw status string to a visual tone. Extend per record type as new statuses appear.
const STATUS_TONE: Record<string, Tone> = {
  not_started: "neutral",
  learning: "info",
  completed: "success",
  revisit: "caution",
  new: "neutral",
  understood: "success",
  exploring: "neutral",
  literature_review: "info",
  planning: "info",
  active: "info",
  paused: "caution",
  archived: "neutral",
  proposed: "neutral",
  under_review: "info",
  tested: "success",
  revised: "caution",
  retired: "neutral",
  draft: "neutral",
  planned: "info",
  ready: "info",
  superseded: "caution",
  cancelled: "error",
  not_required_or_not_assessed: "neutral",
  approval_required: "caution",
  pending: "caution",
  approved: "success",
  rejected: "error",
  concept: "neutral",
  designing: "info",
  building: "info",
  testing: "info",
  built: "success",
  open: "caution",
  investigating: "info",
  resolved: "success",
  wont_fix: "neutral",
  in_progress: "info",
  performed: "success",
  analyzed: "success",
  invalidated: "error",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        TONE_STYLES[tone]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
