"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBuildProject } from "@/lib/actions/build";
import type { BuildBrief, BuildKind } from "@/lib/types/domain";

const KINDS: { value: BuildKind; label: string }[] = [
  { value: "software_ai", label: "Software / AI" },
  { value: "engineering", label: "Engineering device" },
  { value: "simulation", label: "Simulation" },
  { value: "experimental_concept", label: "Experimental concept" },
  { value: "hybrid", label: "Hybrid" },
];

export function NewBuildProjectForm({ briefs }: { briefs: BuildBrief[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<BuildKind>("software_ai");
  const [briefId, setBriefId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
      >
        Skip guide — new build project
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createBuildProject({ title, kind, brief_id: briefId || undefined });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/build/${result.data.id}/overview`);
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Build project title"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as BuildKind)}
        className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {KINDS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
      {briefs.length > 0 && (
        <select
          value={briefId}
          onChange={(e) => setBriefId(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">No linked Build Brief</option>
          {briefs.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      )}
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
