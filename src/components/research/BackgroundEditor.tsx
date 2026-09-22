"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateResearchBackground } from "@/lib/actions/research";

export function BackgroundEditor({
  projectId,
  objective,
  currentFocus,
}: {
  projectId: string;
  objective: string;
  currentFocus: string;
}) {
  const [obj, setObj] = useState(objective);
  const [focus, setFocus] = useState(currentFocus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const dirty = obj !== objective || focus !== currentFocus;

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateResearchBackground(projectId, obj, focus);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-text-primary">Objective</label>
        <textarea
          value={obj}
          onChange={(e) => setObj(e.target.value)}
          rows={3}
          placeholder="What is this investigation trying to establish?"
          className="mt-1 w-full resize-y rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text-primary">Current focus, gaps and reading list</label>
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={5}
          placeholder="Concepts to clarify, open questions, sources still to read…"
          className="mt-1 w-full resize-y rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
