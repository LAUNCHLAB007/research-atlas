"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEntryBody } from "@/lib/actions/explore";

export function EntryEditor({ entryId, initialBody }: { entryId: string; initialBody: string }) {
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const router = useRouter();

  const dirty = body !== initialBody;

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateEntryBody(entryId, body);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-panel px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {!dirty && savedAt && <span className="text-xs text-text-secondary">Saved {savedAt.toLocaleTimeString()}</span>}
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    </div>
  );
}
