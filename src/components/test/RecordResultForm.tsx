"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordTestResult } from "@/lib/actions/test";

export function RecordResultForm({ testId }: { testId: string }) {
  const [observations, setObservations] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [limitations, setLimitations] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await recordTestResult({ test_id: testId, observations, analysis, conclusion, limitations });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setObservations("");
    setAnalysis("");
    setConclusion("");
    setLimitations("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <textarea
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        placeholder="Raw observations"
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={analysis}
        onChange={(e) => setAnalysis(e.target.value)}
        placeholder="Analysis"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={conclusion}
        onChange={(e) => setConclusion(e.target.value)}
        placeholder="Conclusion"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={limitations}
        onChange={(e) => setLimitations(e.target.value)}
        placeholder="Limitations"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Record result"}
      </button>
    </form>
  );
}
