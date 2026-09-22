"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTest } from "@/lib/actions/test";
import type { ResearchProject, ExperimentPlan, PrototypeVersion } from "@/lib/types/domain";

export function NewTestForm({
  projects,
  plans,
  versions,
  initialVersionId,
}: {
  projects: ResearchProject[];
  plans: ExperimentPlan[];
  versions: PrototypeVersion[];
  initialVersionId?: string;
}) {
  const [title, setTitle] = useState("");
  const [linkType, setLinkType] = useState<"project" | "plan" | "version">(initialVersionId ? "version" : "project");
  const [projectId, setProjectId] = useState("");
  const [planId, setPlanId] = useState("");
  const [versionId, setVersionId] = useState(initialVersionId ?? "");
  const [objective, setObjective] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createTest({
      title,
      objective,
      success_criteria: successCriteria,
      research_project_id: linkType === "project" ? projectId || undefined : undefined,
      experiment_plan_id: linkType === "plan" ? planId || undefined : undefined,
      prototype_version_id: linkType === "version" ? versionId || undefined : undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/test/${result.data.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Test title"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="flex gap-1.5">
        {(["project", "plan", "version"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setLinkType(t)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
              linkType === t ? "border-accent bg-accent-selected text-accent-hover" : "border-border text-text-secondary"
            }`}
          >
            {t === "project" ? "Research project" : t === "plan" ? "Experiment plan" : "Prototype version"}
          </button>
        ))}
      </div>
      {linkType === "project" && (
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select a research project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      )}
      {linkType === "plan" && (
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select an experiment plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      )}
      {linkType === "version" && (
        <select
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Select a prototype version…</option>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.version_label}
            </option>
          ))}
        </select>
      )}
      <textarea
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="Objective (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={successCriteria}
        onChange={(e) => setSuccessCriteria(e.target.value)}
        placeholder="Pass criteria (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create test"}
      </button>
    </form>
  );
}
