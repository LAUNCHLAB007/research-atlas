"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSource } from "@/lib/actions/library";
import { TopicPicker } from "@/components/shared/TopicPicker";
import type { SourceKind, Topic } from "@/lib/types/domain";

const KINDS: SourceKind[] = ["paper", "lecture", "course", "dataset", "website", "book", "video", "other"];

export function NewSourceForm({ topics }: { topics: Topic[] }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SourceKind>("paper");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        + Add source
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createSource(
      { kind, title, url, authors, publication_year: year || undefined },
      topicIds
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle("");
    setUrl("");
    setAuthors("");
    setYear("");
    setTopicIds([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
              kind === k ? "border-accent bg-accent-selected text-accent-hover" : "border-border text-text-secondary"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-2 flex gap-2">
        <input
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="Authors, comma-separated"
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="w-28 rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div className="mt-2">
        <TopicPicker topics={topics} selectedIds={topicIds} onChange={setTopicIds} />
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save source"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text-primary">
          Cancel
        </button>
      </div>
    </form>
  );
}
