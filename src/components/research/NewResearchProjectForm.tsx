"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createResearchProject } from "@/lib/actions/research";
import { TopicPicker } from "@/components/shared/TopicPicker";
import type { Topic } from "@/lib/types/domain";

export function NewResearchProjectForm({ topics }: { topics: Topic[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
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
        + New research project
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createResearchProject({ title, question, topicIds });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/research/${result.data.id}/overview`);
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Central question (optional)"
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
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
          {saving ? "Creating…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text-primary">
          Cancel
        </button>
      </div>
    </form>
  );
}
