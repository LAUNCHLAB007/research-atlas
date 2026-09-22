"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { linkSourceToProject } from "@/lib/actions/research";
import type { Source } from "@/lib/types/domain";

export function LinkSourceForm({ projectId, sources }: { projectId: string; sources: Source[] }) {
  const [sourceId, setSourceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceId) return;
    setSaving(true);
    setError(null);
    const result = await linkSourceToProject(projectId, sourceId);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSourceId("");
    router.refresh();
  }

  if (sources.length === 0) {
    return <p className="text-sm text-text-secondary">Add sources in the Library workspace, then link them here.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <select
        value={sourceId}
        onChange={(e) => setSourceId(e.target.value)}
        className="rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Link an existing source…</option>
        {sources.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!sourceId || saving}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Linking…" : "Link"}
      </button>
      {error && <p className="w-full text-sm text-error">{error}</p>}
    </form>
  );
}
