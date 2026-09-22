"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHypothesis } from "@/lib/actions/research";

export function NewHypothesisForm({ projectId }: { projectId: string }) {
  const [statement, setStatement] = useState("");
  const [rationale, setRationale] = useState("");
  const [falsification, setFalsification] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createHypothesis({
      project_id: projectId,
      statement,
      rationale,
      falsification_criteria: falsification,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatement("");
    setRationale("");
    setFalsification("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <textarea
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Hypothesis statement"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="Rationale (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={falsification}
        onChange={(e) => setFalsification(e.target.value)}
        placeholder="What would falsify this? (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !statement.trim()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add hypothesis"}
      </button>
    </form>
  );
}
