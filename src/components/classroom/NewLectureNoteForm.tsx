"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLectureNote } from "@/lib/actions/classroom";
import type { LectureNoteKind } from "@/lib/types/domain";

const KINDS: LectureNoteKind[] = ["note", "question", "summary", "timestamp"];

export function NewLectureNoteForm({ lectureId }: { lectureId: string }) {
  const [kind, setKind] = useState<LectureNoteKind>("note");
  const [body, setBody] = useState("");
  const [videoSecond, setVideoSecond] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await addLectureNote({
      lecture_id: lectureId,
      kind,
      body,
      video_second: videoSecond ? Number(videoSecond) : undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody("");
    setVideoSecond("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] border border-border bg-panel p-3">
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
              kind === k ? "border-accent bg-accent-selected text-accent-hover" : "border-border text-text-secondary"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Note, question, summary…"
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={videoSecond}
          onChange={(e) => setVideoSecond(e.target.value)}
          placeholder="Timestamp (sec)"
          className="w-36 rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add note"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </form>
  );
}
