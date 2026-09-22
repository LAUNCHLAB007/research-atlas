"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPrototypeVersion } from "@/lib/actions/build";

export function NewPrototypeVersionForm({ buildProjectId }: { buildProjectId: string }) {
  const [versionLabel, setVersionLabel] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createPrototypeVersion({
      build_project_id: buildProjectId,
      version_label: versionLabel,
      design_notes: designNotes,
      change_summary: changeSummary,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setVersionLabel("");
    setDesignNotes("");
    setChangeSummary("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-[var(--radius-card)] border border-border bg-panel p-4">
      <input
        value={versionLabel}
        onChange={(e) => setVersionLabel(e.target.value)}
        placeholder="Version label (e.g. v1)"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={designNotes}
        onChange={(e) => setDesignNotes(e.target.value)}
        placeholder="Design notes (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={changeSummary}
        onChange={(e) => setChangeSummary(e.target.value)}
        placeholder="What changed from the previous version? (optional)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !versionLabel.trim()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add version"}
      </button>
    </form>
  );
}
