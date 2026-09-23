"use client";

import { useState } from "react";
import { addSuggestedTopicToClassroom, addSuggestedTopicToLibrary } from "@/lib/actions/ai";
import type { SuggestedTopic } from "@/lib/ai/explore";

export function TopicSuggestionCard({ topic }: { topic: SuggestedTopic }) {
  const [status, setStatus] = useState<"idle" | "saving" | "classroom" | "library">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handle(kind: "classroom" | "library") {
    setStatus("saving");
    setError(null);
    const result = kind === "classroom" ? await addSuggestedTopicToClassroom(topic) : await addSuggestedTopicToLibrary(topic);
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus(kind);
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-panel p-2.5">
      <p className="text-sm font-medium text-text-primary">{topic.label}</p>
      <p className="text-xs text-text-secondary">{topic.description}</p>
      {status === "idle" || status === "saving" ? (
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            disabled={status === "saving"}
            onClick={() => handle("classroom")}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            + Classroom
          </button>
          <button
            type="button"
            disabled={status === "saving"}
            onClick={() => handle("library")}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            + Library
          </button>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-success">Added to {status === "classroom" ? "Classroom" : "Library"}.</p>
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
