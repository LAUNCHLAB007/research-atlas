"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNotebookEntry } from "@/lib/actions/research";
import type { NotebookEntryKind } from "@/lib/types/domain";

const KINDS: NotebookEntryKind[] = ["literature", "observation", "decision", "method", "analysis", "reflection", "other"];

export function NewNotebookEntryForm({ projectId }: { projectId: string }) {
  const [kind, setKind] = useState<NotebookEntryKind>("observation");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createNotebookEntry({ project_id: projectId, kind, body });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody("");
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
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Dated notebook entry…"
        className="mt-2 w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !body.trim()}
        className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
