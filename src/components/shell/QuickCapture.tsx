"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEntry } from "@/lib/actions/explore";
import { TopicPicker } from "@/components/shared/TopicPicker";
import { cn } from "@/lib/cn";
import type { Topic, EntryKind } from "@/lib/types/domain";

const KINDS: { value: EntryKind; label: string }[] = [
  { value: "question", label: "Question" },
  { value: "thought", label: "Thought" },
  { value: "observation", label: "Observation" },
  { value: "idea", label: "Idea" },
  { value: "link", label: "Link" },
];

export function QuickCapture({ topics }: { topics: Topic[] }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<EntryKind>("question");
  const [body, setBody] = useState("");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    setSaving(true);
    setError(null);
    const result = await createEntry({ kind, body, topicIds });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody("");
    setTopicIds([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        + Capture
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/20 p-4 pt-24 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:block md:bg-transparent md:p-0">
          <div className="w-full max-w-md rounded-[var(--radius-dialog)] border border-border bg-panel p-4 shadow-lg">
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    kind === k.value
                      ? "border-accent bg-accent-selected text-accent-hover"
                      : "border-border text-text-secondary"
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What are you curious about?"
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="mt-3">
              <TopicPicker topics={topics} selectedIds={topicIds} onChange={setTopicIds} />
            </div>
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-inset"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving || !body.trim()}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
