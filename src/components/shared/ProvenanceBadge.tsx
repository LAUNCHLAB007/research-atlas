import { cn } from "@/lib/cn";
import type { Provenance } from "@/lib/types/domain";

const PROVENANCE_LABEL: Record<Provenance, string> = {
  user: "You",
  ai_suggestion: "AI suggestion",
  source_excerpt: "Source excerpt",
};

const PROVENANCE_STYLE: Record<Provenance, string> = {
  user: "border-border text-text-secondary",
  ai_suggestion: "border-info text-info",
  source_excerpt: "border-accent text-accent",
};

export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        PROVENANCE_STYLE[provenance]
      )}
    >
      {PROVENANCE_LABEL[provenance]}
    </span>
  );
}
