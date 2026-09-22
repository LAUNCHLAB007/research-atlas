"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Topic } from "@/lib/types/domain";
import { domainById } from "@/lib/constants/domains";

export function TopicPicker({
  topics,
  selectedIds,
  onChange,
}: {
  topics: Topic[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = topics.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search topics…"
        className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {filtered.length === 0 && <p className="text-sm text-text-secondary">No topics match.</p>}
        {filtered.map((topic) => {
          const domain = domainById(topic.domain_id);
          const selected = selectedIds.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggle(topic.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                selected
                  ? "border-accent bg-accent-selected text-accent-hover"
                  : "border-border bg-panel text-text-secondary hover:border-accent"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: domain.colorVar }} aria-hidden />
              {topic.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
