"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveQuestionFromLecture } from "@/lib/actions/explore";

export function SaveQuestionForm({ lectureId }: { lectureId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
      >
        Save question to Explore
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveQuestionFromLecture(lectureId, body);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody("");
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] border border-border bg-panel p-3">
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="What question does this raise?"
        className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save to Explore"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text-primary">
          Cancel
        </button>
      </div>
    </form>
  );
}
