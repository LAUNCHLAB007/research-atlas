"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExperimentPlan } from "@/lib/actions/research";
import type { Hypothesis } from "@/lib/types/domain";

export function NewExperimentPlanForm({ projectId, hypotheses }: { projectId: string; hypotheses: Hypothesis[] }) {
  const [title, setTitle] = useState("");
  const [hypothesisId, setHypothesisId] = useState("");
  const [method, setMethod] = useState("");
  const [controls, setControls] = useState("");
  const [measurementPlan, setMeasurementPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createExperimentPlan({
      project_id: projectId,
      hypothesis_id: hypothesisId || undefined,
      title,
      method,
      controls,
      measurement_plan: measurementPlan,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle("");
    setMethod("");
    setControls("");
    setMeasurementPlan("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Plan title"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {hypotheses.length > 0 && (
        <select
          value={hypothesisId}
          onChange={(e) => setHypothesisId(e.target.value)}
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">No linked hypothesis</option>
          {hypotheses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.statement.slice(0, 60)}
            </option>
          ))}
        </select>
      )}
      <textarea
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        placeholder="Method"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={controls}
        onChange={(e) => setControls(e.target.value)}
        placeholder="Controls (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={measurementPlan}
        onChange={(e) => setMeasurementPlan(e.target.value)}
        placeholder="Measurement plan (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add experiment plan"}
      </button>
    </form>
  );
}
