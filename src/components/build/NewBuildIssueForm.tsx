"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBuildIssue } from "@/lib/actions/build";
import type { PrototypeVersion } from "@/lib/types/domain";

export function NewBuildIssueForm({ buildProjectId, versions }: { buildProjectId: string; versions: PrototypeVersion[] }) {
  const [title, setTitle] = useState("");
  const [observation, setObservation] = useState("");
  const [versionId, setVersionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createBuildIssue({
      build_project_id: buildProjectId,
      prototype_version_id: versionId || undefined,
      title,
      observation,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle("");
    setObservation("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Issue title"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {versions.length > 0 && (
        <select
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">No specific version</option>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.version_label}
            </option>
          ))}
        </select>
      )}
      <textarea
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        placeholder="What did you observe?"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Log issue"}
      </button>
    </form>
  );
}
